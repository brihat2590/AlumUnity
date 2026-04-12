'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Plus, X, Upload, ScrollText, MessageCircleMore, GraduationCap, Sparkles } from 'lucide-react';
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
        <section className="relative min-h-screen bg-slate-50 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-50/50 via-indigo-50/20 to-transparent pointer-events-none" />
            
            <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 lg:py-16 space-y-12">
                
                {/* Hero Header */}
                <header className="mx-auto max-w-4xl px-6 pb-12 pt-5 sm:pt-10 text-center">
                    <span className="mb-6 inline-block rounded-full border border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                        Exclusive Access
                    </span>

                    <h1
                        className="mb-8 text-5xl font-extralight tracking-tight text-[#0f172a] md:text-6xl"
                        style={{ fontFamily: 'var(--font-manrope)' }}
                    >
                        The <span className="font-semibold italic">Resume</span> Exchange
                    </h1>

                    <p
                        className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-slate-500"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        An elite collection of resumes curated for the AlumUnity network.
                        Upload your resume to receive highly valuable, private feedback from our inner circle.
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 sm:items-center md:px-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                                <ScrollText className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Community Resumes</h2>
                                <p className="text-sm font-medium text-slate-500">
                                    {isLoadingResumes ? 'Loading...' : `${resumes.length} published for review`}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setShowUploadForm(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-600 transition-all hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} /> 
                            Submit Resume
                        </button>
                    </div>

                    {/* Resumes Grid */}
                    {isLoadingResumes ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p className="font-medium">Loading community resumes...</p>
                            </div>
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 px-4 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                                    <Sparkles className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mt-2">No resumes yet</h3>
                                <p className="text-slate-500 max-w-sm">Be the first one to publish and get reviewed by the community.</p>
                                <button 
                                    onClick={() => setShowUploadForm(true)}
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Upload yours now <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {resumes.map((resume) => (
                                <Link
                                    href={`/resumereview/${resume.slug}`}
                                    key={resume.id}
                                    className="luxury-shadow luxury-shadow-hover group flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-8 border border-slate-100 transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div>
                                        <div className="mb-6 flex items-start justify-between">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-slate-100 shadow-sm transition-colors group-hover:ring-indigo-100">
                                                <ScrollText className="h-8 w-8 text-indigo-500 transition-colors group-hover:text-indigo-600" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200/80 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:ring-indigo-100">
                                                <MessageCircleMore className="h-3.5 w-3.5" />
                                                {resume.commentsCount || 0}
                                            </div>
                                        </div>

                                        <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-bold tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-indigo-500" style={{ fontFamily: "var(--font-manrope, inherit)" }}>
                                            {resume.title}
                                        </h3>
                                        
                                        <div className="my-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-white">
                                                {resume.postedByName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] uppercase tracking-tighter text-slate-400">Curated by</span>
                                                <span className="truncate text-sm font-bold text-[#0f172a]">
                                                    {resume.postedByName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                           {formatDate(resume.createdAt)}
                                        </span>
                                        <span className="inline-flex items-center text-indigo-500 transition duration-300 group-hover:translate-x-1">
                                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Upload Form Overlay */}
            {showUploadForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6 opacity-100 transition-opacity">
                    <div className="relative w-full max-w-2xl transform rounded-3xl bg-white p-6 text-left align-middle shadow-2xl ring-1 ring-slate-200/50 transition-all sm:p-8">
                        
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Submit your resume</h3>
                                <p className="mt-1 text-sm text-slate-500">Upload your file to get feedback from the community.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUploadForm(false)}
                                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Resume title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Seeking Junior Backend Roles - Need Review"
                                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 border border-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Resume File (PDF, DOC)</label>
                                <div className="relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition-colors hover:bg-slate-100 hover:border-indigo-300 text-center">
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
                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <Upload className="mb-3 h-8 w-8 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        Click to browse or drag and drop your file here
                                    </span>
                                    <span className="mt-1 text-xs text-slate-500">
                                        Max file size: 5MB
                                    </span>
                                </div>
                            </div>

                            {selectedFile && (
                                <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                                    <GraduationCap className="h-8 w-8 text-indigo-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-700">
                                            {selectedFile.name}
                                        </p>
                                    </div>
                                    {!uploadedResumeData?.url && (
                                        <button
                                            type="button"
                                            disabled={isFileUploading}
                                            onClick={uploadResumeFile}
                                            className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200 shadow-sm transition hover:bg-indigo-50 disabled:opacity-50"
                                        >
                                            {isFileUploading ? 'Uploading...' : 'Upload File'}
                                        </button>
                                    )}
                                    {uploadedResumeData?.url && (
                                        <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                                            Uploaded
                                        </span>
                                    )}
                                </div>
                            )}

                            {previewUrl && (
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
                                        <span className="text-xs font-bold uppercase text-slate-600">Preview</span>
                                    </div>
                                    <iframe src={previewUrl} title="Resume preview" className="h-[300px] w-full sm:h-[400px]" />
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadForm(false)}
                                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600 transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:ring-slate-300"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                                        </>
                                    ) : (
                                        <>
                                            Publish Review Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}