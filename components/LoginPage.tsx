"use client";

import { useState } from "react";
import { AuthFormComponent } from "./AuthForm";
import { BackgroundComponent } from "./Background";

const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <>
      <BackgroundComponent />
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md px-4 py-8">
          <AuthFormComponent mode={mode} onModeChange={setMode} />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
