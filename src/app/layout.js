import './globals.css';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'SlotMD – First Available Cancellation Appointments',
  description: 'Get matched with the first clinic cancellation that fits your schedule.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
