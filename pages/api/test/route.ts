'use server'

import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    redirect('https://nextjs.org/')
}
