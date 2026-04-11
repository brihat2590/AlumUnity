'use client'
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOpportunity, getAllOpportunities } from "@/firebase/oppertunities.controller";
import Link from "next/link";
import { toast } from "sonner";
import { useFirebase } from "@/firebase/firebase.config";
import { getUserInfo } from "@/firebase/user.controller";
import { ArrowDown, Globe, MapPin, Wallet, BriefcaseBusiness } from "lucide-react";
import { Inter, Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

type OpportunityItem = oppertunityData & {
  id: string;
};

type OpportunityFormData = Omit<oppertunityData, "postedBy" | "type"> & {
  type: OppertunityType | "";
};

const initialOpportunityData = {
  title: "",
  Company: "",
  companyUrl: "",
  logoUrl: "",
  type: "",
  location: "",
  salary: "",
  applicationLink: "",
  vacancy: "",
} satisfies OpportunityFormData;

const Opportunities = () => {
  const { loggedInUser } = useFirebase();
  const userId = loggedInUser?.uid || "";

  const [opportunityData, setOpportunityData] = useState(initialOpportunityData);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [userMap, setUserMap] = useState<Record<string, { name: string; profilePic?: string }>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOpportunityData({ ...opportunityData, [name]: value });
  };

  const handleSaveOpportunity = async () => {
    if (!opportunityData.companyUrl.trim()) {
      toast.error("Please include the company URL to make the opportunity listing look better.");
      return;
    }

    if (!opportunityData.logoUrl.trim()) {
      toast.error("Please include the company logo URL so the opportunity card looks more attractive.");
      return;
    }

    if (!opportunityData.type) {
      toast.error("Please select the opportunity type.");
      return;
    }

    const data: oppertunityData = {
      ...opportunityData,
      type: opportunityData.type,
      postedBy: userId,
    };
    const response = await createOpportunity(data);

    if (response.success) {
      toast.success("Opportunity created successfully!");
      fetchOpportunities();
      setOpportunityData(initialOpportunityData);
      setIsDialogOpen(false);
    } else {
      toast.error(`Failed to create opportunity: ${response.message}`);
    }
  };

  const fetchOpportunities = async () => {
    const response = await getAllOpportunities();

    if (response.success) {
      const fetchedOpportunities = (response.data ?? []) as OpportunityItem[];
      setOpportunities(fetchedOpportunities);

      const uniquePosterIds = [...new Set(fetchedOpportunities.map((item) => item.postedBy).filter(Boolean))];
      if (uniquePosterIds.length) {
        const posterDetails = await Promise.all(
          uniquePosterIds.map(async (id) => {
            const userResponse = await getUserInfo(id);
            const userData = userResponse.success && userResponse.data ? (userResponse.data as UserData) : undefined;
            return {
              id,
              name: userData?.name || "Unknown User",
              profilePic: userData?.profilePic || "",
            };
          })
        );

        const nextMap: Record<string, { name: string; profilePic?: string }> = {};
        posterDetails.forEach((poster) => {
          nextMap[poster.id] = { name: poster.name, profilePic: poster.profilePic };
        });
        setUserMap(nextMap);
      }
    } else {
      toast.error(`Failed to fetch opportunities: ${response.message}`);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return (
    <>
      <div className={`${manrope.variable} ${inter.variable} min-h-screen bg-white text-[#0f172a] antialiased`}>
        <header className="mx-auto max-w-4xl px-6 pb-24 pt-24 text-center md:pt-32">
          <span className="mb-6 inline-block rounded-full border border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
            Exclusive Access
          </span>

          <h1
            className="mb-8 text-5xl font-extralight tracking-tight text-[#0f172a] md:text-6xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            The <span className="font-semibold italic">Career</span> Exchange
          </h1>

          <p
            className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-slate-500"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            An elite collection of high-impact opportunities curated for the AlumUnity network.
            Access private referrals and senior leadership mandates shared within our inner circle.
          </p>
        </header>

        <main className="mx-auto max-w-7xl px-6 pb-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <article
                  key={opportunity.id}
                  className="luxury-shadow luxury-shadow-hover group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-10 transition-all duration-500"
                >
                  <div className="mb-10 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-50 bg-slate-50/50">
                      {opportunity.logoUrl ? (
                        <img
                          src={opportunity.logoUrl}
                          alt={`${opportunity.Company} logo`}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <span
                          className="text-2xl font-bold text-slate-500"
                          style={{ fontFamily: "var(--font-manrope)" }}
                        >
                          {(opportunity.Company || "A").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <span className="rounded-full bg-indigo-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                      {opportunity.type === "Internship" ? "Referral" : "Urgent"}
                    </span>
                  </div>

                  <div className="mb-8">
                    <h3
                      className="mb-2 text-2xl font-bold tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-indigo-500"
                      style={{ fontFamily: "var(--font-manrope)" }}
                    >
                      {opportunity.title}
                    </h3>

                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                      {opportunity.Company}
                    </p>
                  </div>

                  <div className="mb-12 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={16} />
                      <span className="font-medium">{opportunity.location}</span>
                    </div>

                    {opportunity.salary ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Wallet size={16} />
                        <span className="font-medium">{opportunity.salary}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <BriefcaseBusiness size={16} />
                        <span className="font-medium">{opportunity.type}</span>
                      </div>
                    )}

                    {opportunity.companyUrl ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Globe size={16} />
                        <Link href={opportunity.companyUrl} target="_blank" className="font-medium hover:text-indigo-500">
                          Company Site
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-8">
                    <div className="flex items-center gap-3">
                      {userMap[opportunity.postedBy]?.profilePic ? (
                        <img
                          src={userMap[opportunity.postedBy].profilePic}
                          alt={userMap[opportunity.postedBy].name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                          {(userMap[opportunity.postedBy]?.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-tighter text-slate-400">Curated by</p>
                        <p
                          className="text-sm font-bold text-[#0f172a]"
                          style={{ fontFamily: "var(--font-manrope)" }}
                        >
                          {userMap[opportunity.postedBy]?.name || "Loading..."}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={opportunity.applicationLink}
                      target="_blank"
                      className="text-xs font-bold uppercase tracking-widest text-indigo-500 transition-transform hover:translate-x-1"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50/50 p-12 text-center text-slate-500">
                No opportunities available yet.
              </div>
            )}
          </div>

          
        </main>

        <footer className="w-full border-t border-slate-50 bg-white px-8 py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-12 md:flex-row md:space-y-0">
            <span
              className="text-2xl font-extrabold tracking-tighter text-[#0f172a]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Alumni Elite
            </span>

            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              © 2026 Editorial Prestige Alumni Network.
            </p>

            <div className="flex gap-10">
              <a className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-indigo-500" href="#">
                Privacy
              </a>
              <a className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-indigo-500" href="#">
                Terms
              </a>
              <a className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-indigo-500" href="#">
                Contact
              </a>
            </div>
          </div>
        </footer>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-12 right-12 z-50 h-16 w-16 rounded-full bg-[#0f172a] text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
              +
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-slate-100 p-8 sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle
                className="text-2xl font-bold text-[#0f172a]"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Add Opportunity
              </DialogTitle>

              <DialogDescription className="text-slate-500">
                Fill in the opportunity details. Please include the company URL so the listing looks more complete and polished.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Role Title</Label>
                <Input id="title" name="title" value={opportunityData.title} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Company">Company Name</Label>
                <Input id="Company" name="Company" value={opportunityData.Company} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyUrl">Company URL</Label>
                <Input
                  id="companyUrl"
                  name="companyUrl"
                  placeholder="https://company.com"
                  value={opportunityData.companyUrl}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500">Include the official company website URL for better presentation.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Company Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  placeholder="https://.../logo.png"
                  value={opportunityData.logoUrl}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500">Add a company logo URL so the card looks more premium and attractive.</p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={opportunityData.type}
                    onChange={handleChange}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Type</option>
                    <option value="Internship">Internship</option>
                    <option value="Job">Job</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={opportunityData.location} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input id="salary" name="salary" value={opportunityData.salary} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vacancy">Vacancy</Label>
                  <Input id="vacancy" name="vacancy" value={opportunityData.vacancy} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="applicationLink">Application Link</Label>
                <Input
                  id="applicationLink"
                  name="applicationLink"
                  placeholder="https://..."
                  value={opportunityData.applicationLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleSaveOpportunity} className="bg-indigo-600 text-white hover:bg-indigo-700">
                Save Opportunity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        .luxury-shadow {
          box-shadow: 0 4px 60px -12px rgba(0, 0, 0, 0.03);
        }

        .luxury-shadow-hover:hover {
          box-shadow: 0 20px 80px -20px rgba(99, 102, 241, 0.08);
        }
      `}</style>
    </>
  );
};

export default Opportunities;