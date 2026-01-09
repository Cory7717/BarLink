import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { resetOwnerPassword } from "@/lib/passwordReset";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    await resetOwnerPassword(String(token), hashedPassword);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }
}
