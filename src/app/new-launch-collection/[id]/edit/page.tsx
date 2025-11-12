"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NewLaunchForm, { NewLaunchFormValues } from "../../components/NewLaunchForm";

export default function EditNewLaunchPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const id = idParam ? Number(idParam) : undefined;
  const [initial, setInitial] = useState<Partial<NewLaunchFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/new-launch-collection/${id}`);
        if (!res.ok) throw new Error("Failed to load new launch");
        const data = await res.json();
        setInitial({
          title: data.title ?? "",
          summary: data.summary ?? "",
          image: data.image ?? "",
          location: data.location ?? "",
          district: data.district ?? "",
          status: data.status ?? "Registration Open",
          type: data.type ?? "Condo",
          bedrooms: data.bedrooms ?? "",
          price: data.price ?? "",
          url: data.url ?? "",
          launchDate: data.launchDate ?? "",
          developer: data.developer ?? "",
          units: data.units ?? "",
          views: data.views ?? "",
        });
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (!id) return <div className="px-4 py-6 text-red-600">Invalid ID</div>;
  if (loading) return <div className="px-4 py-6">Loading...</div>;
  if (error) return <div className="px-4 py-6 text-red-600">{error}</div>;
  if (!initial) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <NewLaunchForm mode="edit" id={id} initialValues={initial} />
    </div>
  );
}


