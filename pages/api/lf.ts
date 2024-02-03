import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.redirect("https://loot.foundation/", {status: 302});
}
