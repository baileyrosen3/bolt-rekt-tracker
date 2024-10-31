"use client";

export function BackgroundComponent() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gray-800" />
      <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
    </div>
  );
}
