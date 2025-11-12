"use client";

import NewLaunchForm from "../components/NewLaunchForm";

export default function NewLaunchCreatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <NewLaunchForm mode="create" />
    </div>
  );
}


