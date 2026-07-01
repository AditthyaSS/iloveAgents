import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Globe,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "Information We Collect",
    content:
      "iLoveAgents collects only the information necessary to operate and improve the platform. This may include account information (when provided), workflow configurations, technical information such as browser type, and anonymous usage statistics.",
  },
  {
    icon: Database,
    title: "Cookies & Local Storage",
    content:
      "iLoveAgents uses your browser's local storage to improve your experience. For example, recently viewed agents and certain user preferences may be stored locally on your device. This information stays in your browser and can be cleared at any time through your browser settings.",
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content:
      "Information collected through the platform is used to provide core functionality, improve performance, troubleshoot issues, understand feature usage, and enhance future releases. We do not sell your personal information.",
  },
  {
    icon: Lock,
    title: "Data Security",
    content:
      "Reasonable technical and organizational safeguards are implemented to protect information from unauthorized access, disclosure, or misuse. While no online service can guarantee absolute security, we continuously work to strengthen our security practices.",
  },
  {
    icon: ShieldCheck,
    title: "Your Privacy Rights",
    content:
      "You may clear browser-stored data, including local storage, at any time using your browser settings. Where applicable, users may request access to, correction of, or deletion of personal information collected by the platform.",
  },
  {
    icon: Globe,
    title: "Third-Party Services",
    content:
      "iLoveAgents may integrate with third-party AI providers, APIs, or external services. Those services operate under their own privacy policies and terms, and users should review them before sharing information.",
  },
  {
    icon: RefreshCw,
    title: "Policy Updates",
    content:
      "This Privacy Policy may be updated periodically to reflect new features, improvements, or legal requirements. The 'Last Updated' date at the top of this page indicates the most recent revision.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    content:
      "If you have questions about this Privacy Policy or how your information is handled, please contact the project maintainers by opening an issue or discussion on the official GitHub repository.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#06070A] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-400/20 mb-6">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-slate-300">
              Privacy & Data Protection
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold">
            Privacy <span className="text-cyan-400">Policy</span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-400 leading-8">
            Your privacy matters. This Privacy Policy explains what
            information iLoveAgents collects, how it is used, how browser
            storage is utilized, your rights regarding your data, and the
            measures taken to protect your information while using the
            platform.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-slate-400">
          <Calendar size={18} />
          <span>Last Updated: June 2026</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 backdrop-blur-xl p-8 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                  <Icon className="text-cyan-400" size={28} />
                </div>

                <h2 className="text-2xl font-semibold mb-4">
                  {section.title}
                </h2>

                <p className="text-slate-400 leading-8">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Transparency & Trust
          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto leading-8">
            We are committed to building an open-source AI ecosystem that
            values transparency, security, and user control. As the platform
            evolves, this Privacy Policy may be updated to reflect new
            features, changes in data practices, or legal requirements.
            Continued use of the platform after updates constitutes acceptance
            of the revised policy.
          </p>
        </div>
      </div>
    </div>
  );
}
