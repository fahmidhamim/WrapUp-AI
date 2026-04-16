import { motion } from "framer-motion";
import stripeLogo from "@/assets/logos/stripe-full.svg";
import slackLogo from "@/assets/logos/slack-full.svg";
import figmaLogo from "@/assets/logos/figma-full.svg";
import vercelLogo from "@/assets/logos/vercel-full.svg";
import linearLogo from "@/assets/logos/linear-full.svg";
import loomLogo from "@/assets/logos/loom-full.svg";
import zoomLogo from "@/assets/logos/zoom-full.svg";
import googleLogo from "@/assets/logos/google.svg";
import microsoftLogo from "@/assets/logos/microsoft.svg";
import spotifyLogo from "@/assets/logos/spotify.svg";
import githubLogo from "@/assets/logos/github.svg";
import discordLogo from "@/assets/logos/discord.svg";
import airbnbLogo from "@/assets/logos/airbnb.svg";
import shopifyLogo from "@/assets/logos/shopify.svg";
import dropboxLogo from "@/assets/logos/dropbox.svg";
import webexLogo from "@/assets/logos/webex.svg";
import amazonLogo from "@/assets/logos/amazon.svg";
import googlemeetLogo from "@/assets/logos/googlemeet.svg";
import gotomeetingLogo from "@/assets/logos/gotomeeting.svg";
import adobeLogo from "@/assets/logos/adobe.svg";
import ringcentralLogo from "@/assets/logos/ringcentral.svg";
import zohoLogo from "@/assets/logos/zoho.svg";
import dialpadLogo from "@/assets/logos/dialpad.svg";
import kumospaceLogo from "@/assets/logos/kumospace.svg";
import nextivaLogo from "@/assets/logos/nextiva.svg";
import larkLogo from "@/assets/logos/lark.svg";
import amazonchimeLogo from "@/assets/logos/amazonchime.svg";

const logos: { name: string; src: string; invert?: boolean }[] = [
  { name: "Stripe", src: stripeLogo },
  { name: "Slack", src: slackLogo },
  { name: "Google", src: googleLogo },
  { name: "Microsoft", src: microsoftLogo },
  { name: "Figma", src: figmaLogo },
  { name: "Spotify", src: spotifyLogo },
  { name: "GitHub", src: githubLogo, invert: true },
  { name: "Vercel", src: vercelLogo, invert: true },
  { name: "Discord", src: discordLogo },
  { name: "Linear", src: linearLogo },
  { name: "Airbnb", src: airbnbLogo },
  { name: "Loom", src: loomLogo },
  { name: "Shopify", src: shopifyLogo },
  { name: "Zoom", src: zoomLogo },
  { name: "Dropbox", src: dropboxLogo },
  { name: "Webex", src: webexLogo, invert: true },
  { name: "Amazon", src: amazonLogo, invert: true },
  { name: "Google Meet", src: googlemeetLogo },
  { name: "GoTo Meeting", src: gotomeetingLogo },
  { name: "Adobe Connect", src: adobeLogo, invert: true },
  { name: "RingCentral", src: ringcentralLogo },
  { name: "Zoho Meeting", src: zohoLogo },
  { name: "Dialpad", src: dialpadLogo },
  { name: "Kumospace", src: kumospaceLogo },
  { name: "Nextiva", src: nextivaLogo },
  { name: "Lark", src: larkLogo },
  { name: "Amazon Chime", src: amazonchimeLogo, invert: true },
];

export default function TrustedBySection() {
  return (
    <section className="relative py-16 z-20" id="trusted-by">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-10 font-medium">
          Trusted by teams at
        </p>

        <div className="relative overflow-hidden">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex gap-14 items-center animate-marquee w-max">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2"
              >
                <img
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  className={`h-16 w-auto object-contain ${logo.invert ? "invert" : ""}`}
                />
                <span className="text-xl font-bold text-foreground/60 whitespace-nowrap">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
