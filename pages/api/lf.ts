import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.redirect("https://loot.foundation/", {status: 302});
}

export  function Handler() {
    return NextResponse.redirect("https://loot.foundation/", {status: 302});
}
