import {
  FileText,
  Users,
  ShieldAlert,
  Copyright,
  Ban,
  RefreshCw,
  Mail,
  Calendar,
} from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    content:
      "By accessing or using iLoveAgents, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the platform.",
  },
  {
    icon: Users,
    title: "Use of the Platform",
    content:
      "iLoveAgents is provided as an open-source tool for building, running, and managing AI agent workflows. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the service.",
  },
  {
    icon: ShieldAlert,
    title: "No Warranty",
    content:
      "iLoveAgents is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or completely secure.",
  },
  {
    icon: Ban,
    title: "Limitation of Liability",
    content:
      "To the fullest extent permitted by law, the maintainers and contributors of iLoveAgents shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the platform.",
  },
  {
    icon: Copyright,
    title: "Intellectual Property",
    content:
      "iLoveAgents is open-source software. Source code is made available under the project's license on GitHub. Third-party integrations, AI providers, and agent definitions may be subject to their own separate licensing terms.",
  },
  {
    icon: RefreshCw,
    title: "Changes to These Terms",
    content:
      "These Terms of Service may be updated periodically to reflect new features, improvements, or legal requirements. The \"Last Updated\" date at the top of this page indicates the most recent revision. Continued use of the platform after changes constitutes acceptance of the revised terms.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    content:
      "If you have questions about these Terms of Service, please contact the project maintainers by opening an issue or discussion on the official GitHub repository.",
  },
];

export default function TermsOfService() {
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
            <FileText className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-slate-300">
              Legal & Platform Usage
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold">
            Terms of <span className="text-cyan-400">Service</span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-400 leading-8">
            These Terms of Service outline the rules and guidelines for using
            iLoveAgents, including your responsibilities as a user, the
            limitations of the platform, and how intellectual property is
            handled.
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
            Questions About These Terms?
          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto leading-8">
            iLoveAgents is an open-source project built and maintained by its
            community. If anything in these terms is unclear, or if you'd
            like to suggest a change, please reach out through the official
            GitHub repository.
          </p>
        </div>
      </div>
    </div>
  );
}