import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  imageSrc?: string;
  imageAlt?: string;
  layout?: "form-left" | "form-right";
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
  imageSrc,
  imageAlt,
  layout = "form-left",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Form Section */}
        <div
          className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${
            imageSrc
              ? layout === "form-left"
                ? "lg:flex-none lg:w-1/2"
                : "lg:flex-none lg:w-1/2 lg:order-2"
              : "w-full"
          }`}
        >
          <div
            className={`mx-auto w-full ${
              imageSrc ? "max-w-md lg:w-full lg:max-w-lg" : "max-w-4xl"
            }`}
          >
            {/* Logo */}
            <div
              className={`flex ${
                imageSrc ? "justify-center lg:justify-start" : "justify-center"
              }`}
            >
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peyr.ai</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dream. Pair. Do.</p>
                </div>
              </Link>
            </div>

            {/* Title and Subtitle */}
            <div
              className={`mt-8 ${
                imageSrc ? "text-center lg:text-left" : "text-center"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>

            {/* Form Content */}
            <div className="mt-8">
              <div className="py-8 px-4 sm:px-10">{children}</div>
            </div>

            {/* Footer */}
            <div
              className={`mt-8 ${
                imageSrc ? "text-center lg:text-left" : "text-center"
              }`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {footerText}{" "}
                <Link
                  href={footerLink}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        {imageSrc && (
          <div
            className={`hidden lg:flex lg:flex-1 lg:items-center lg:justify-center ${
              layout === "form-left" ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <div className="w-full h-full relative">
              <Image
                src={imageSrc}
                alt={imageAlt || title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
