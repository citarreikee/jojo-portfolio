import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import ExperimentFolders from './components/ExperimentFolders'
import WorksCarousel, { WorkMedia, works } from './components/WorksCarousel'
import DriftWall, { type DriftWallItem } from './components/DriftWall'
import LogoLoop, { type LogoLoopItem } from './components/LogoLoop'
import galleryManifest from 'virtual:gallery-items'

const publicPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const Lanyard = lazy(() => import('./components/Lanyard'))

const portraitImage = publicPath('/assets/marcus-portrait-hero.webp')

const navLinks = [
  { label: 'Story', href: '#story' },
  { label: 'Works', href: '#jobs' },
  { label: 'Experiments & Notes', href: '#experiments' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#message' },
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/citarreikee' },
  { label: 'X', href: 'https://x.com/citarreikee' },
  { label: 'RedNote', href: 'https://xhslink.com/m/8feyjuHEnoM' },
]

const services = [
  {
    title: 'FDE',
    practice: 'Forward-Deployed Engineering',
    availability: 'Available',
  },
  {
    title: 'Startup Advisory',
    practice: 'Strategy · Product',
    availability: 'Available',
  },
  {
    title: 'AI Hardware Prototyping',
    practice: 'Devices · Robotics',
    availability: 'By Scope',
  },
  {
    title: 'Software Design & Polish',
    practice: 'Product · Interface',
    availability: 'Available',
  },
]

const trustedLogos: LogoLoopItem[] = [
  {
    src: publicPath('/assets/logos/pingan.png'),
    alt: 'Ping An',
    title: 'Ping An',
    href: 'https://group.pingan.com/',
  },
  {
    src: publicPath('/assets/logos/miracleplus.png'),
    alt: 'MiraclePlus',
    title: 'MiraclePlus',
    href: 'https://www.miracleplus.com/',
  },
  {
    src: publicPath('/assets/logos/nvidia.svg'),
    alt: 'NVIDIA',
    title: 'NVIDIA',
    href: 'https://www.nvidia.com/',
  },
  {
    src: publicPath('/assets/logos/xjtu.png'),
    alt: 'Xi’an Jiaotong University',
    title: 'Xi’an Jiaotong University',
    href: 'https://www.xjtu.edu.cn/',
  },
  {
    src: publicPath('/assets/logos/moonlex.png'),
    alt: 'Moonlex AI',
    title: 'Moonlex AI',
    href: 'https://moonlexai.com/',
  },
  {
    src: publicPath('/assets/logos/drobotics.svg'),
    alt: 'D-Robotics',
    title: 'D-Robotics',
    href: 'https://developer.d-robotics.cc/en',
  },
  {
    src: publicPath('/assets/logos/gravity-player.png'),
    alt: 'GravityPlayer',
    title: 'GravityPlayer',
    href: 'https://www.gravityplayer.com/',
  },
  {
    src: publicPath('/assets/logos/seeed-studio.png'),
    alt: 'Seeed Studio',
    title: 'Seeed Studio',
    href: 'https://www.seeed.cc/',
  },
  {
    src: publicPath('/assets/logos/hackathon-weekly.png'),
    alt: 'Hackathon Weekly',
    title: 'Hackathon Weekly',
    href: 'https://hackathonweekly.com/',
  },
  {
    src: publicPath('/assets/logos/robotstorm.png'),
    alt: 'RobotStorm',
    title: 'RobotStorm',
    href: 'https://robotstorm.tech/',
  },
]

const placeholderGalleryItems: DriftWallItem[] = [
  { image: 'https://picsum.photos/id/1015/600/400', title: 'Gallery placeholder 01' },
  { image: 'https://picsum.photos/id/1025/600/400', title: 'Gallery placeholder 02' },
  { image: 'https://picsum.photos/id/1039/600/400', title: 'Gallery placeholder 03' },
  { image: 'https://picsum.photos/id/1043/600/400', title: 'Gallery placeholder 04' },
  { image: 'https://picsum.photos/id/1044/600/400', title: 'Gallery placeholder 05' },
  { image: 'https://picsum.photos/id/1050/600/400', title: 'Gallery placeholder 06' },
  { image: 'https://picsum.photos/id/1062/600/400', title: 'Gallery placeholder 07' },
  { image: 'https://picsum.photos/id/1069/600/400', title: 'Gallery placeholder 08' },
  { image: 'https://picsum.photos/id/1074/600/400', title: 'Gallery placeholder 09' },
]

const galleryItems: DriftWallItem[] = (galleryManifest.length
  ? galleryManifest
  : placeholderGalleryItems).map((item) => ({
  ...item,
  image: item.image.startsWith('/') ? publicPath(item.image) : item.image,
}))

const animationDelay = (milliseconds: number): CSSProperties => ({
  animationDelay: `${milliseconds}ms`,
})

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setVisible(true)
        observer.unobserve(element)
      },
      { threshold: 0.15 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={elementRef}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="mb-14 flex w-full justify-between border-b border-cream/20 pb-4 font-hn text-xs uppercase tracking-[0.2em] text-cream/50 sm:mb-20">
      <span>
        {index} — {title}
      </span>
      <span>Jojo</span>
    </Reveal>
  )
}

function Hero() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <section
      className={`sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#a19ea2] font-hn text-cream ${
        drawerOpen ? 'z-[70]' : 'z-0'
      }`}
    >
      <div className="anim-fade-in absolute inset-0 bg-[#a19ea2]" aria-hidden="true" />

      <div
        className="anim-fade-up absolute inset-x-0 top-[16vh] z-10 overflow-hidden pb-[0.34em] sm:top-[14vh]"
        style={animationDelay(500)}
        aria-label="Jojorn — Sun"
      >
        <div className="marquee -translate-y-[0.04em] flex w-max whitespace-nowrap pb-[0.12em] font-hn text-[16vh] leading-[1.16] text-cream sm:text-[26vh]">
          <span className="pr-[6vw]" aria-hidden="true">
            <span className="font-jojo">Jojorn</span> &mdash; Sun&nbsp;
          </span>
          <span className="pr-[6vw]" aria-hidden="true">
            <span className="font-jojo">Jojorn</span> &mdash; Sun&nbsp;
          </span>
        </div>
      </div>

      <div
        className="anim-line absolute inset-x-6 bottom-[7.5rem] z-10 h-0.5 origin-left bg-cream sm:inset-x-10 sm:bottom-36"
        style={animationDelay(1200)}
      />

      <footer className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-6 pb-5 font-hn text-xs leading-relaxed sm:z-10 sm:px-10 sm:pb-8 sm:text-sm">
        <div className="anim-fade-up" style={animationDelay(1400)}>
          <p>AI Founder</p>
          <p>Spatial Intelligence Builder</p>
          <p>Connecting AI to The Physical World</p>
          <p className="mt-2 text-cream/60">Guild Master After Midnight</p>
        </div>
        <div className="anim-fade-up text-right" style={animationDelay(1550)}>
          <p>For minds</p>
          <p>For machines</p>
          <p>For the world between</p>
        </div>
      </footer>

      <img
        src={portraitImage}
        fetchPriority="high"
        decoding="async"
        alt="Portrait"
        className="anim-rise-in pointer-events-none absolute inset-0 z-20 h-full w-full object-cover"
        style={animationDelay(300)}
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 text-cream sm:px-10 sm:pt-8">
        <a
          href="#"
          className="anim-fade-up font-jojo text-lg tracking-wide"
          style={animationDelay(800)}
        >
          Jojo
        </a>

        <div className="hidden items-start gap-16 sm:flex lg:gap-24">
          <span className="anim-fade-up text-sm" style={animationDelay(900)}>
            2026
          </span>
          <nav className="flex flex-col gap-0.5 text-sm" aria-label="Site index">
            {navLinks.map((link, index) => (
              <a
                href={link.href}
                key={link.label}
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={animationDelay(1000 + index * 80)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <nav className="flex flex-col gap-0.5 text-sm" aria-label="Social links">
            {socialLinks.map((link, index) => (
              <a
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={animationDelay(1150 + index * 80)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <button
        type="button"
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen((open) => !open)}
        className="anim-fade-up fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center sm:hidden"
        style={animationDelay(900)}
      >
        <span className="relative block h-4 w-6" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-6 bg-cream transition-all duration-500 ease-drawer ${
              drawerOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-cream transition-opacity duration-300 ${
              drawerOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 block h-0.5 w-6 bg-cream transition-all duration-500 ease-drawer ${
              drawerOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
          <X
            size={26}
            strokeWidth={1.5}
            className={`absolute left-1/2 top-1/2 -ml-[13px] -mt-[13px] transition-all duration-500 ease-drawer ${
              drawerOpen
                ? 'rotate-0 opacity-100 delay-300'
                : 'pointer-events-none rotate-90 opacity-0 delay-0'
            }`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 sm:hidden ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      >
        <aside
          className={`absolute inset-y-0 right-0 w-[80%] max-w-sm bg-[#141414] px-8 py-10 transition-transform duration-[600ms] ease-drawer ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col justify-center">
            <p
              className={`mb-7 border-b border-cream/20 pb-4 text-xs uppercase tracking-[0.2em] text-cream/50 transition-all duration-500 ease-out ${
                drawerOpen
                  ? 'translate-y-0 opacity-100 delay-[250ms]'
                  : 'translate-y-4 opacity-0 delay-0'
              }`}
            >
              Site Index
            </p>
            <nav className="flex flex-col" aria-label="Mobile site index">
              {navLinks.map((link, index) => (
                <a
                  href={link.href}
                  key={link.label}
                  onClick={() => setDrawerOpen(false)}
                  className={`text-4xl leading-[1.2] transition-all duration-500 ease-out ${
                    drawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                  style={{
                    transitionDelay: drawerOpen ? `${300 + index * 80}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <p
              className={`mb-5 mt-16 text-xs uppercase tracking-[0.2em] text-cream/50 transition-all duration-500 ease-out ${
                drawerOpen
                  ? 'translate-y-0 opacity-100 delay-500'
                  : 'translate-y-4 opacity-0 delay-0'
              }`}
            >
              Find Me
            </p>
            <nav
              className="flex flex-wrap gap-x-6 gap-y-3 text-sm"
              aria-label="Mobile social links"
            >
              {socialLinks.map((link, index) => (
                <a
                  href={link.href}
                  key={link.label}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setDrawerOpen(false)}
                  className={`transition-all duration-500 ease-out ${
                    drawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: drawerOpen ? `${550 + index * 60}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Story() {
  const storyRef = useRef<HTMLElement>(null)
  const [showLanyard, setShowLanyard] = useState(false)

  useEffect(() => {
    const section = storyRef.current
    if (!section || showLanyard) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShowLanyard(true)
        observer.disconnect()
      },
      { threshold: 0.08 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [showLanyard])

  return (
    <section
      ref={storyRef}
      id="story"
      className="story-section relative min-h-[100dvh] text-cream"
    >
      <div className="story-lanyard" role="img" aria-label="Jojo portrait card, @citarreikee. Drag to swing; click to flip.">
        {showLanyard && (
          <Suspense fallback={<div className="h-full w-full" aria-hidden="true" />}>
            <Lanyard
              frontImage={publicPath('/assets/lanyard/jojo-front.webp')}
              backImage={publicPath('/assets/lanyard/jojo-back.webp')}
              size={0.6}
              strapLength={0.5}
              breeze={0.5}
            />
          </Suspense>
        )}
      </div>

      <div className="story-copy relative z-0 px-6 py-24 sm:px-10 sm:py-36">
        <SectionLabel index="01" title="Story" />

        <div className="grid gap-14 lg:grid-cols-[2fr_1fr] lg:gap-24">
          <Reveal>
            <p className="max-w-4xl font-hn text-3xl leading-[1.15] sm:text-5xl">
              I build AI that reaches beyond the screen — into devices, robots and the physical
              spaces around us.
            </p>
          </Reveal>
          <div aria-hidden="true" />
        </div>

        <Reveal className="mt-20 sm:mt-28" delay={100}>
          <p className="max-w-xl text-sm leading-relaxed text-cream/60 sm:text-base">
            I believe intelligence should expand human agency, not ask people to behave like
            machines. The future worth building is more capable, humane and beautiful — technology
            that enters life naturally, and earns its place there.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section
      id="services"
      className="relative flex h-[100dvh] min-h-[640px] flex-col overflow-hidden px-6 pb-[clamp(3rem,6vh,5rem)] pt-8 text-cream sm:px-10 sm:pt-10"
    >
      <Reveal className="flex w-full justify-between border-b border-cream/20 pb-3 font-hn text-[10px] uppercase tracking-[0.2em] text-cream/50 sm:pb-4 sm:text-xs">
        <span>04 — Services</span>
        <span>Jojo</span>
      </Reveal>

      <Reveal className="mt-14 sm:mt-20">
        <p className="max-w-4xl font-hn text-3xl leading-[1.15] sm:text-5xl">
          I’m happy to help turn ambitious ideas into things that work — and feel worth using.
        </p>
      </Reveal>

      <div className="mt-14 sm:mt-20">
        {services.map((service, index) => (
          <Reveal key={service.title} delay={index * 60}>
            <a
              href="#message"
              className="group grid grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 border-t border-cream/20 py-[clamp(0.7rem,1.4vh,1rem)] transition-colors duration-300 last:border-b hover:bg-cream/5 sm:grid-cols-[2.25rem_minmax(0,1fr)_12rem_1.5rem] sm:gap-x-6"
            >
              <span className="text-xs text-cream/40">0{index + 1}</span>
              <span className="font-hn text-xl leading-[1.02] transition-transform duration-500 ease-smooth group-hover:translate-x-2 sm:text-2xl lg:text-[1.7rem]">
                {service.title}
              </span>
              <span className="col-start-2 mt-1 text-xs text-cream/50 sm:col-start-auto sm:mt-0 sm:text-sm">
                {service.practice}
              </span>
              <ArrowUpRight
                size={19}
                strokeWidth={1.5}
                className="row-span-2 opacity-45 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100 sm:row-span-1"
                aria-hidden="true"
              />
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 sm:mt-20" delay={120}>
        <p className="mb-[clamp(0.65rem,1.5vh,1.1rem)] font-hn text-[9px] uppercase tracking-[0.22em] text-cream/50 sm:text-[10px]">
          Trusted by:
        </p>
        <div className="min-w-0 overflow-hidden">
          <LogoLoop
            logos={trustedLogos}
            speed={58}
            direction="left"
            logoHeight={34}
            gap={72}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#0d0d0d"
            ariaLabel="Organizations that have trusted or supported Jojo's work"
            className="trusted-logo-loop"
          />
        </div>
      </Reveal>
    </section>
  )
}

function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin: '600px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="gallery" className="relative h-[100dvh] min-h-[640px] overflow-hidden pb-10 text-cream sm:pb-14">
      <Reveal className="absolute inset-x-6 top-7 z-20 flex justify-between border-b border-cream/20 pb-3 font-hn text-[10px] uppercase tracking-[0.2em] text-cream/50 sm:inset-x-10 sm:top-10 sm:pb-4 sm:text-xs">
        <span>05 — Gallery</span>
        <span>Jojo</span>
      </Reveal>

      <Reveal className="absolute inset-x-0 bottom-14 top-32 sm:bottom-20 sm:top-36" delay={80}>
        {nearViewport && <DriftWall
          items={galleryItems}
          columns={6}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          grayscale
          overlayColor="#0d0d0d"
        />}
      </Reveal>
    </section>
  )
}

function Message() {
  return (
    <section id="message" className="overflow-hidden py-24 text-cream sm:py-36">
      <div className="px-6 sm:px-10">
        <SectionLabel index="06" title="Contact" />
      </div>

      <Reveal>
        <div
          className="overflow-hidden"
          aria-label="Let’s build something that belongs in the world"
        >
          <div className="marquee flex w-max whitespace-nowrap font-hn text-[10vh] leading-none text-cream/10 sm:text-[18vh]">
            <span className="pr-[6vw]" aria-hidden="true">
              Let’s build something that belongs in the world —&nbsp;
            </span>
            <span className="pr-[6vw]" aria-hidden="true">
              Let’s build something that belongs in the world —&nbsp;
            </span>
          </div>
        </div>
      </Reveal>

      <div className="mt-16 px-6 sm:mt-24 sm:px-10">
        <Reveal>
          <p className="mb-7 max-w-xl text-sm leading-relaxed text-cream/60 sm:mb-10 sm:text-base">
            For collaborations, advisory, prototypes or ambitious ideas.
          </p>
          <a
            href="mailto:citarreikee@gmail.com"
            aria-label="Email citarreikee@gmail.com"
            className="group inline-flex items-start font-hn text-4xl leading-none transition-opacity duration-300 hover:opacity-60 sm:text-7xl"
          >
            citarreikee@gmail.com
            <ArrowUpRight
              size={36}
              strokeWidth={1.5}
              className="ml-3 hidden shrink-0 transition-transform duration-500 ease-smooth group-hover:-translate-y-1 group-hover:translate-x-1 sm:block"
            />
          </a>
        </Reveal>

        <Reveal className="mt-14 sm:mt-20" delay={100}>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Contact socials">
            {socialLinks.map((link) => (
              <a
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
                className="transition-opacity duration-300 hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="px-6 pb-8 font-hn text-cream sm:px-10">
      <div className="mb-6 h-px bg-cream/20" />
      <div className="flex flex-col gap-3 text-xs text-cream/50 sm:flex-row sm:justify-between sm:gap-8">
        <p>© 2026 Jojo</p>
        <p>Shenzhen, China</p>
        <a href="/notes/" className="transition-opacity duration-300 hover:opacity-60">Notes ↗</a>
        <a href="#" className="transition-opacity duration-300 hover:opacity-60">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}

function App() {
  const preview = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("preview");
  if (preview && works.some(p => p.id === preview)) return <div className="capture-stage"><WorkMedia id={preview}/></div>;
  return (
    <main className="bg-[#0d0d0d]">
      <h1 className="sr-only">Jojorn (Jojo) Sun — AI Founder &amp; Spatial Intelligence Builder</h1>
      <Hero />
      <div className="relative z-30 rounded-t-[1.5rem] border-t border-cream/20 bg-[#0d0d0d] shadow-[0_-24px_60px_rgba(0,0,0,0.32)] sm:rounded-t-[2rem]">
        <Story />
        <WorksCarousel />
        <ExperimentFolders />
        <Services />
        <Gallery />
        <Message />
        <SiteFooter />
      </div>
    </main>
  )
}

export default App
