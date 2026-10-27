import { HiOutlineClock } from 'react-icons/hi2';

export default function ApprovalBanner({ profile }) {
  if (!profile || profile.isApproved) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl bg-gold-100 px-4 py-3 text-sm text-navy-900">
      <HiOutlineClock className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        <span className="font-semibold">Awaiting admin approval.</span> Students can't see your profile or message you until an
        administrator approves your account. You can finish your profile in the meantime.
      </p>
    </div>
  );
}
