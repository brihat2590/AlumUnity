'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, UploadCloud, FileText, MessageSquare, ArrowRight, Plus } from 'lucide-react';
import { useFirebase } from '@/firebase/firebase.config';
import { createResumePost, getAllResumePosts } from '@/firebase/resume.controller';

const toSlug = (title: string) =>
    title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

const formatDate = (input: any) => {
    const date = input?.seconds ? new Date(input.seconds * 1000) : new Date(input);
    if (Number.isNaN(date.getTime())) {
        return 'Just now';
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function ResumeReview() {
    const { loggedInUser } = useFirebase();

    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [resumes, setResumes] = useState<ResumePost[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedResumeData, setUploadedResumeData] = useState<{
        url: string;
        publicId: string;
        originalFilename: string;
    } | null>(null);

    const canSubmit = useMemo(() => {
        return Boolean(title.trim() && selectedFile && uploadedResumeData?.url && loggedInUser?.uid && !isUploading);
    }, [title, selectedFile, uploadedResumeData?.url, loggedInUser?.uid, isUploading]);

    const fetchResumes = async () => {
        setIsLoadingResumes(true);
        const response = await getAllResumePosts();
        if (response.success) {
            setResumes(response.data || []);
        } else {
            toast.error(response.message || 'Failed to load resumes');
        }
        setIsLoadingResumes(false);
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const uploadResumeFile = async () => {
        if (!selectedFile) {
            toast.error('Please choose a resume file first');
            return false;
        }

        setIsFileUploading(true);
        try {
            const uploadForm = new FormData();
            uploadForm.append('file', selectedFile);

            const uploadResponse = await fetch('/api/cloudinary/upload', {
                method: 'POST',
                body: uploadForm,
            });
            const uploadData = await uploadResponse.json();

            if (!uploadData.success) {
                toast.error(uploadData.message || 'Upload failed');
                return false;
            }

            const resolvedUrl =
                uploadData.data?.url ||
                uploadData.data?.secureUrl ||
                uploadData.data?.publicUrl ||
                '';

            if (!resolvedUrl || !uploadData.data?.publicId) {
                toast.error('Upload succeeded but response is missing file URL or public ID');
                return false;
            }

            setUploadedResumeData({
                url: resolvedUrl,
                publicId: uploadData.data.publicId,
                originalFilename: uploadData.data.originalFilename,
            });
            toast.success('Resume file uploaded. You can now publish.');
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
            return false;
        } finally {
            setIsFileUploading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loggedInUser?.uid) {
            toast.error('Please sign in to upload a resume');
            return;
        }

        if (!selectedFile) {
            toast.error('Please choose a resume file first');
            return;
        }

        const cleanTitle = title.trim();
        if (!cleanTitle) {
            toast.error('Please add a resume title');
            return;
        }

        try {
            setIsUploading(true);

            if (!uploadedResumeData?.url || !uploadedResumeData.publicId) {
                toast.error('Please upload the resume file before publishing');
                return;
            }

            const slug = `${toSlug(cleanTitle)}-${Date.now().toString().slice(-6)}`;
            const saveResponse = await createResumePost({
                title: cleanTitle,
                slug,
                resumeUrl: uploadedResumeData.url,
                publicId: uploadedResumeData.publicId,
                fileName: selectedFile.name,
                postedBy: loggedInUser.uid,
                postedByName: loggedInUser.displayName || loggedInUser.email?.split('@')[0] || 'Anonymous',
                postedByEmail: loggedInUser.email || 'No email',
            });

            if (!saveResponse.success) {
                toast.error(saveResponse.message || 'Failed to save resume');
                setIsUploading(false);
                return;
            }

            toast.success('Resume uploaded and published for review');
            setTitle('');
            setSelectedFile(null);
            setUploadedResumeData(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            await fetchResumes();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong while uploading');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 md:px-8 md:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(165,180,252,0.16),transparent_38%)]" />
            <div className="relative mx-auto max-w-7xl space-y-10">
                <header className="px-1 md:px-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500/90">Resume Atelier</p>
                    <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
                        Publish your resume and receive thoughtful alumni feedback
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                        Upload your resume, share your profile story, and open the door for valuable guidance from your network.
                        Every resume card leads to a dedicated review thread.
                    </p>
                </header>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1 md:px-2">
                        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Community Resumes</h2>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-indigo-700 shadow-[0_8px_24px_-18px_rgba(79,70,229,0.85)] ring-1 ring-indigo-100/70 backdrop-blur">
                                {resumes.length} published
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowUploadForm((prev) => !prev)}
                                className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-[0_12px_26px_-20px_rgba(79,70,229,0.95)] ring-1 ring-indigo-100/80 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                            >
                                <Plus className="h-3.5 w-3.5" /> Review your resume
                            </button>
                        </div>
                    </div>

                    {isLoadingResumes ? (
                        <div className="rounded-[28px] bg-white/80 p-7 text-sm text-slate-600 shadow-[0_22px_50px_-40px_rgba(79,70,229,0.8)] ring-1 ring-indigo-100/80 backdrop-blur">
                            Loading resumes...
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="rounded-[28px] bg-white/75 p-7 text-sm text-slate-600 shadow-[0_22px_50px_-40px_rgba(79,70,229,0.7)] ring-1 ring-indigo-100/80 backdrop-blur">
                            No resumes yet. Be the first one to publish and get reviewed.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {resumes.map((resume) => (
                                <Link
                                    href={`/resumereview/${resume.slug}`}
                                    key={resume.id}
                                    className="group rounded-[28px] bg-white/85 p-6 shadow-[0_26px_56px_-42px_rgba(79,70,229,0.8)] ring-1 ring-indigo-100/75 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:ring-indigo-200"
                                >
                                    <FileText className="mb-4 h-5 w-5 text-indigo-600/90" />

                                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{resume.title}</h3>
                                    <p className="mt-2 text-xs text-slate-600">by {resume.postedByName}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatDate(resume.createdAt)}</p>

                                    <div className="mt-5 flex items-center justify-between text-xs text-slate-600">
                                        <span className="inline-flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" /> {resume.commentsCount || 0} comments
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-medium text-indigo-700 transition group-hover:translate-x-1">
                                            Open thread <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {showUploadForm && (
                        <form
                            onSubmit={handleUpload}
                            className="rounded-[30px] bg-white/85 p-6 shadow-[0_30px_65px_-45px_rgba(79,70,229,0.8)] ring-1 ring-indigo-100/80 backdrop-blur md:p-7"
                        >
                            <h3 className="mb-5 text-lg font-semibold text-slate-900">Review your resume</h3>

                            <label className="mb-2 block text-sm text-slate-700">Resume title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Review my resume for Backend Engineering"
                                className="mb-4 w-full rounded-2xl bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-indigo-100 transition focus:ring-2 focus:ring-indigo-200"
                            />

                            <label className="mb-2 block text-sm text-slate-700">File (PDF or DOC)</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setSelectedFile(file);
                                    setUploadedResumeData(null);
                                    if (previewUrl) {
                                        URL.revokeObjectURL(previewUrl);
                                    }
                                    setPreviewUrl(file ? URL.createObjectURL(file) : null);
                                }}
                                className="mb-4 block w-full rounded-2xl border border-dashed border-indigo-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                            />

                            {selectedFile && (
                                <p className="mb-4 truncate rounded-xl bg-indigo-50/70 px-3 py-2 text-xs text-indigo-700">
                                    Selected: {selectedFile.name}
                                </p>
                            )}

                            {previewUrl && (
                                <div className="mb-4 overflow-hidden rounded-2xl bg-white ring-1 ring-indigo-100/80">
                                    <p className="border-b border-indigo-100/80 bg-indigo-50/70 px-3 py-2 text-xs font-medium text-indigo-700">
                                        Resume preview
                                    </p>
                                    <iframe src={previewUrl} title="Resume preview" className="h-72 w-full" />
                                </div>
                            )}

                            {uploadedResumeData?.url && (
                                <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                                    File uploaded successfully. Click Publish Resume to list it.
                                </p>
                            )}

                            <button
                                type="button"
                                disabled={!selectedFile || isFileUploading}
                                onClick={uploadResumeFile}
                                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200/90 transition hover:-translate-y-0.5 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isFileUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading file...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-4 w-4" /> Upload Resume File
                                    </>
                                )}
                            </button>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-20px_rgba(79,70,229,0.75)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-4 w-4" /> Publish Resume
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}