import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const validRoles = ["client", "nutritionist", "trainer", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Role must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
    }

    // Update the user's metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, role },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Role updated to "${role}" for ${email}. Please sign out and sign back in for the change to take effect.`,
      user: { email, role },
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}