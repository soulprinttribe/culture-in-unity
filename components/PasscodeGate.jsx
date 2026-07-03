"use client";

import { useEffect, useState } from "react";

// Simple staff gate: passcode kept in sessionStorage, sent as a header
// to admin APIs which verify it server-side against ADMIN_PASSCODE.
export function usePasscode() {
  const [passcode, setPasscode] = useState("");
  useEffect(() => {
    setPasscode(sessionStorage.getItem("ciu_admin_pass") || "");
  }, []);
  const save = (p) => {
    sessionStorage.setItem("ciu_admin_pass", p);
    setPasscode(p);
  };
  return [passcode, save];
}

export default function PasscodeGate({ onSubmit }) {
  const [value, setValue] = useState("");
  return (
    <div className="card mt-3" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h3>Staff access</h3>
      <label htmlFor="pass">Passcode</label>
      <input
        id="pass"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit(value)}
      />
      <button className="btn mt-2" style={{ width: "100%" }} onClick={() => onSubmit(value)}>
        Enter
      </button>
    </div>
  );
}
