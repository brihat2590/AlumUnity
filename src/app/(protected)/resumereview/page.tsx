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
        <section className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 md:px-8">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-sky-300/25 blur-3xl" />

            <div className="relative mx-auto max-w-6xl space-y-8">
                <header className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(99,102,241,0.45)] md:p-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Resume Atelier</p>
                    <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
                        Publish your resume and receive thoughtful alumni feedback
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
                        Upload your resume, share your profile story, and open the door for valuable guidance from your network.
                        Every resume card leads to a dedicated review thread.
                    </p>
                </header>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Community Resumes</h2>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                                {resumes.length} published
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowUploadForm((prev) => !prev)}
                                className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                            >
                                <Plus className="h-3.5 w-3.5" /> Review your resume
                            </button>
                        </div>
                    </div>

                    {isLoadingResumes ? (
                        <div className="rounded-2xl border border-indigo-100 bg-white p-6 text-sm text-slate-600">
                            Loading resumes...
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 text-sm text-slate-600">
                            No resumes yet. Be the first one to publish and get reviewed.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {resumes.map((resume) => (
                                <Link
                                    href={`/resumereview/${resume.slug}`}
                                    key={resume.id}
                                    className="group rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_40px_-28px_rgba(99,102,241,0.6)]"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <FileText className="h-5 w-5" />
                                    </div>

                                    <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{resume.title}</h3>
                                    <p className="mt-2 text-xs text-slate-600">by {resume.postedByName}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatDate(resume.createdAt)}</p>

                                    <div className="mt-5 flex items-center justify-between text-xs text-slate-600">
                                        <span className="inline-flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" /> {resume.commentsCount || 0} comments
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-medium text-indigo-700 transition group-hover:translate-x-0.5">
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
                            className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(99,102,241,0.6)] md:p-6"
                        >
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">Review your resume</h3>

                            <label className="mb-2 block text-sm text-slate-700">Resume title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Review my resume for Backend Engineering"
                                className="mb-4 w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-300"
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
                                className="mb-4 block w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                            />

                            {selectedFile && (
                                <p className="mb-4 truncate rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                                    Selected: {selectedFile.name}
                                </p>
                            )}

                            {previewUrl && (
                                <div className="mb-4 overflow-hidden rounded-xl border border-indigo-100 bg-white">
                                    <p className="border-b border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
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
                                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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