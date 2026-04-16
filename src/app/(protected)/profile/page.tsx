'use client';

import React, { useEffect, useState } from 'react';
import { updateUserInfo, getUserInfo } from '@/firebase/user.controller';
import { toast } from 'sonner';
import { useFirebase } from '@/firebase/firebase.config';
import { Save, School, BriefcaseBusiness, Globe, X, Camera } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

type ProfileFormState = {
  name: string;
  batch: string;
  Role: Role | '';
  profilePic: string;
  Education: string;
  Bio: string;
  linkedIn: string;
  github: string;
  twitter: string;
  portfolio: string;
};

const emptyFormState: ProfileFormState = {
  name: '',
  batch: '',
  Role: '',
  profilePic: '',
  Education: '',
  Bio: '',
  linkedIn: '',
  github: '',
  twitter: '',
  portfolio: '',
};

const Profile = () => {
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || '';

  const [formData, setFormData] = useState<ProfileFormState>(emptyFormState);
  const [initialFormData, setInitialFormData] = useState<ProfileFormState>(emptyFormState);

  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [initialSkills, setInitialSkills] = useState<string[]>([]);
  const [initialInterests, setInitialInterests] = useState<string[]>([]);

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await getUserInfo(userId);
        if (response.success && response.data) {
          const userData = response.data;
          const nextFormData: ProfileFormState = {
            name: userData.name || '',
            batch: userData.batch || '',
            Role: userData.Role || '',
            profilePic: userData.profilePic || '',
            Education: userData.Education || '',
            Bio: userData.Bio || '',
            linkedIn: userData.linkedIn || '',
            github: userData.github || '',
            twitter: userData.twitter || '',
            portfolio: userData.portfolio || '',
          };
          const nextSkills = userData.skills || [];
          const nextInterests = userData.interests || [];

          setFormData(nextFormData);
          setInitialFormData(nextFormData);
          setSkills(nextSkills);
          setInterests(nextInterests);
          setInitialSkills(nextSkills);
          setInitialInterests(nextInterests);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();
    if (nextSkill && !skills.includes(nextSkill)) {
      setSkills([...skills, nextSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddInterest = () => {
    const nextInterest = interestInput.trim();
    if (nextInterest && !interests.includes(nextInterest)) {
      setInterests([...interests, nextInterest]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleDiscardChanges = () => {
    setFormData(initialFormData);
    setSkills(initialSkills);
    setInterests(initialInterests);
    setSkillInput('');
    setInterestInput('');
    toast.success('Changes discarded.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('User is not authenticated. Please try again.');
      return;
    }

    const userInfo = {
      ...formData,
      Role: formData.Role || undefined,
      skills,
      interests,
    };

    setIsSaving(true);
    const response = await updateUserInfo(userId, userInfo);
    if (response.success) {
      setInitialFormData(formData);
      setInitialSkills(skills);
      setInitialInterests(interests);
      toast.success('Profile saved successfully.');
    } else {
      toast.error(response.message || 'Failed to save profile.');
    }
    setIsSaving(false);
  };

  const avatarSrc = formData.profilePic || loggedInUser?.photoURL || '';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 md:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h1
            className="mb-8 text-5xl font-extralight tracking-tight text-[#0f172a] md:text-6xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Edit <span className="font-semibold italic">Profile</span> 
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Define your professional legacy within the AlumUnity network with precision and clarity.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full   px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Elite Community Member
          </span>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <FaSpinner className="animate-spin text-xl" />
          </div>
        ) : (
        <form onSubmit={handleSave} className="space-y-14">
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="mx-auto w-fit">
                <div className="relative">
                  <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] ring-1 ring-slate-200">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-4xl font-bold text-indigo-700">
                        {(formData.name || loggedInUser?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 rounded-full bg-indigo-600 p-2 text-white shadow-lg">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <label className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Image URL (HOSTED EXTERNALLY)
              </label>
              <input
                type="text"
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                placeholder="https://image-url.com/profile.jpg"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:col-span-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Batch Year
                </label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="e.g. 2023"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Community Role
                </label>
                <select
                  name="Role"
                  value={formData.Role}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">Select Role</option>
                  <option value="STUDENT">Student</option>
                  <option value="ALUMNI">Alumni</option>
                </select>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-12">
            <div className="mb-6 flex items-center gap-3">
              <School className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Academic Background</h2>
            </div>

            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Education
            </label>
            <input
              type="text"
              name="Education"
              value={formData.Education}
              onChange={handleChange}
              placeholder="Your degree, college, specialization"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </section>

          <section className="border-t border-slate-200 pt-12">
            <div className="mb-6 flex items-center gap-3">
              <BriefcaseBusiness className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Professional Profile</h2>
            </div>

            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Biography
            </label>
            <textarea
              name="Bio"
              value={formData.Bio}
              onChange={handleChange}
              rows={5}
              placeholder="Tell your story..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Core Skills
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Interests
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {interest}
                      <button type="button" onClick={() => handleRemoveInterest(interest)}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    placeholder="Add an interest"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-12">
            <div className="mb-6 flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Digital Presence</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">LinkedIn</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/username"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Portfolio</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-10 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Keep your profile fresh so alumni and students can connect with you easily.
            </p>

            <div className="flex w-full gap-3 md:w-auto">
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 md:w-auto"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-16px_rgba(79,70,229,0.8)] transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
              >
                <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </main>
  );
};

export default Profile;