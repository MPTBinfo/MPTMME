import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'MPTM 2026 | Morning Experiences',description:'Madhya Pradesh Travel Mart — live morning activity dashboard and coordinator participant lists.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
