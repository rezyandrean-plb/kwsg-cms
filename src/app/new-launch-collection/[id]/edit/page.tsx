"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NewLaunchForm, { NewLaunchFormValues } from "../../components/NewLaunchForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

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
          visibility: data.visibility ?? "Show",
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

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Invalid ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading new launch details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-medium">Error loading new launch</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initial) return null;

  return <NewLaunchForm mode="edit" id={id} initialValues={initial} />;
}
