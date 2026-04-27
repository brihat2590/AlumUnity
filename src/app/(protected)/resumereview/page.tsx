'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Plus, X, Upload, ScrollText, MessageCircleMore, GraduationCap, Sparkles } from 'lucide-react';
import { useFirebase } from '@/firebase/firebase.config';
import { createResumePost, getAllResumePosts } from '@/firebase/resume.controller';
import { getUserInfo } from '@/firebase/user.controller';
import { FaSpinner } from 'react-icons/fa';

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
    const [userMap, setUserMap] = useState<Record<string, { name: string, profilePic: string, role: string }>>({});
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
            const fetchedResumes = response.data || [];
            
            const userIds = [...new Set(fetchedResumes.map((r: ResumePost) => r.postedBy).filter(Boolean))];
            const userFetches = await Promise.all(
                userIds.map(async (id) => {
                    const user = await getUserInfo(id);
                    const userData = user?.data as any;
                    return {
                        id,
                        name: userData?.name || 'AlumUnity User',
                        profilePic: userData?.profilePic || '',
                        role: userData?.Role || 'AlumUnity User',
                    };
                })
            );

            const updatedUserMap: Record<string, { name: string, profilePic: string, role: string }> = {};
            userFetches.forEach(({ id, name, profilePic, role }) => {
                updatedUserMap[id] = { name, profilePic, role };
            });

            setUserMap(updatedUserMap);
            setResumes(fetchedResumes);
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
        <section className="relative min-h-screen bg-white pb-20 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_15%_0%,rgba(129,140,248,0.1),transparent_45%),radial-gradient(circle_at_85%_5%,rgba(99,102,241,0.07),transparent_48%)] pointer-events-none" />
            
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
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-3xl bg-white p-4 shadow-[0_30px_70px_-60px_rgba(79,70,229,0.55)] backdrop-blur sm:items-center md:px-6">
                        <div className="flex items-center gap-4">
                            
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
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_35px_-23px_rgba(79,70,229,0.82)] ring-1 ring-indigo-600 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-[0_20px_38px_-22px_rgba(79,70,229,0.9)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} /> 
                            Submit Resume
                        </button>
                    </div>

                    {/* Resumes Grid */}
                    {isLoadingResumes ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-[32px] bg-white shadow-[0_24px_55px_-48px_rgba(79,70,229,0.4)]">
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                <p className="font-medium"><FaSpinner className="animate-spin" /> Loading community resumes...</p>
                            </div>
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-[32px] bg-white px-4 text-center shadow-[0_24px_55px_-48px_rgba(79,70,229,0.4)]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center text-slate-400">
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
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                            {resumes.map((resume) => {
                                const poster = userMap[resume.postedBy];
                                
                                return (
                                <Link
                                    href={`/resumereview/${resume.slug}`}
                                    key={resume.id}
                                    className="luxury-shadow luxury-shadow-hover group flex flex-col justify-between overflow-hidden rounded-[30px] border border-transparent bg-gradient-to-br from-white via-white to-indigo-50/25 p-8 shadow-[0_30px_70px_-58px_rgba(79,70,229,0.55)] [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,rgba(99,102,241,0.42),rgba(99,102,241,0.18),rgba(15,23,42,0.12))_border-box] transition-all duration-500 hover:-translate-y-1 hover:[background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,rgba(99,102,241,0.6),rgba(99,102,241,0.24),rgba(15,23,42,0.16))_border-box]"
                                >
                                    <div>
                                        <div className="mb-6 flex items-start justify-between">
                                            
                                            <div className="flex items-center gap-1.5 px-1 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-hover:text-indigo-700">
                                                <MessageCircleMore className="h-3.5 w-3.5" />
                                                {resume.commentsCount || 0}
                                            </div>
                                        </div>

                                        <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-bold tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-indigo-500" style={{ fontFamily: "var(--font-manrope, inherit)" }}>
                                            {resume.title}
                                        </h3>
                                        
                                        <div className="my-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 overflow-hidden flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-white">
                                                {poster?.profilePic ? (
                                                    <img src={poster.profilePic} alt={resume.postedByName} className="h-full w-full object-cover" />
                                                ) : (
                                                    resume.postedByName?.charAt(0).toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] uppercase tracking-tighter text-slate-400">{poster?.role || 'Curated by'}</span>
                                                <span className="truncate text-sm font-bold text-[#0f172a]">
                                                    {poster?.name || resume.postedByName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-6">
                                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                           {formatDate(resume.createdAt)}
                                        </span>
                                        <span className="inline-flex items-center text-indigo-500 transition duration-300 group-hover:translate-x-1">
                                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                                        </span>
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Upload Form Overlay */}
            {showUploadForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/30 p-4 backdrop-blur-sm sm:p-6 opacity-100 transition-opacity">
                    <div className="relative w-full max-w-2xl transform rounded-[32px] bg-gradient-to-br from-white via-white to-indigo-50/20 p-6 text-left align-middle shadow-[0_48px_90px_-52px_rgba(15,23,42,0.45)] transition-all sm:p-8">
                        
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Submit your resume</h3>
                                <p className="mt-1 text-sm text-slate-500">Upload your file to get feedback from the community.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUploadForm(false)}
                                className="rounded-full p-2 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
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
                                <div className="relative flex w-full flex-col items-center justify-center rounded-2xl bg-slate-50/70 px-6 py-8 transition-colors hover:bg-slate-50 text-center">
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
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3">
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
                                            className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200 shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50"
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
                                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-34px_rgba(79,70,229,0.5)]">
                                    <div className="flex items-center justify-between bg-white px-4 py-2">
                                        <span className="text-xs font-bold uppercase text-slate-600">Preview</span>
                                    </div>
                                    <iframe src={previewUrl} title="Resume preview" className="h-[300px] w-full sm:h-[400px]" />
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-end gap-3 pt-5">
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