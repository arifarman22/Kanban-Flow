'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useReveal } from '@/lib/useReveal';

const features = [
  {
    title: 'Drag & Drop',
    desc: 'Move tasks between columns and reorder with smooth, conflict-free drag-and-drop powered by stable position indexing.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9h8M8 12h5M8 15h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    title: 'Team Collaboration',
    desc: 'Share boards with teammates by email. Control who has access and manage members directly from the board.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    title: 'Secure Auth',
    desc: 'JWT-based authentication with bcrypt password hashing. Access control enforced at every API endpoint.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Unlimited Boards',
    desc: 'Create as many boards as you need. Each board has its own columns, tasks, and dedicated team members.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    title: 'Real-time Updates',
    desc: 'Optimistic UI updates keep your board feeling instant. Changes sync to the database with full conflict resolution.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Docker Ready',
    desc: 'Spin up the entire stack — database, backend, and frontend — with a single docker-compose command.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-9-9v4m4-4v4m4-4v4" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "KanbanFlow replaced three tools for our team. The drag-and-drop is buttery smooth and the sharing flow is dead simple.",
    name: "Sarah K.",
    role: "Engineering Lead",
    initials: "SK",
  },
  {
    quote: "Finally a kanban board that doesn't feel bloated. Clean UI, fast API, and it just works out of the box.",
    name: "Marcus T.",
    role: "Product Manager",
    initials: "MT",
  },
  {
    quote: "We spun it up with Docker in under 5 minutes. The Neon PostgreSQL integration made cloud deployment trivial.",
    name: "Priya R.",
    role: "Full-stack Developer",
    initials: "PR",
  },
];

const row1 = [
  {
    name: 'Next.js 15', desc: 'App Router, RSC',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.499-.054z" /></svg>,
  },
  {
    name: 'TypeScript', desc: 'End-to-end types',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.306.34v2.458a3.95 3.95 0 00-.643-.361 5.093 5.093 0 00-.717-.26 5.453 5.453 0 00-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 00-.623.242c-.17.104-.3.229-.393.374a.888.888 0 00-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 01-1.012 1.085 4.38 4.38 0 01-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 01-1.84-.164 5.544 5.544 0 01-1.512-.493v-2.63a5.033 5.033 0 003.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 00-.074-1.089 2.12 2.12 0 00-.537-.5 5.597 5.597 0 00-.807-.444 27.72 27.72 0 00-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 011.47-.629 7.536 7.536 0 011.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" /></svg>,
  },
  {
    name: 'React', desc: 'UI components',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M14.23 12.004a2.236 2.236 0 01-2.235 2.236 2.236 2.236 0 01-2.236-2.236 2.236 2.236 0 012.235-2.236 2.236 2.236 0 012.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 00-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44a23.476 23.476 0 00-3.107-.534A23.892 23.892 0 0012 4.164c-.592.985-1.148 2.01-1.656 3.07a23.9 23.9 0 00-3.107.534 23.897 23.897 0 01-.244-1.416c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.638-.127zm-.008 7.538c.14.328.275.662.4 1 .126.339.243.682.352 1.024-.37.07-.748.133-1.13.186a23.98 23.98 0 01-1.35.106 23.98 23.98 0 01-1.35-.106 23.98 23.98 0 01-1.13-.186c.11-.342.226-.685.352-1.024.126-.338.26-.672.4-1 .14.328.275.662.4 1 .126.339.243.682.352 1.024zm-3.49-4.618c.37.07.748.133 1.13.186.45.06.9.093 1.35.106.45-.013.9-.046 1.35-.106.382-.053.76-.116 1.13-.186a23.98 23.98 0 01-.352 1.024c-.126.338-.26.672-.4 1a23.98 23.98 0 01-.4-1 23.98 23.98 0 01-.352-1.024zm-4.1 8.56c.666-.382.955-1.835.73-3.704a23.476 23.476 0 00-.25-1.44 23.476 23.476 0 003.107.534A23.892 23.892 0 0012 19.844c.592-.985 1.148-2.01 1.656-3.07a23.9 23.9 0 003.107-.534 23.897 23.897 0 01.244 1.416c.23 1.868-.054 3.32-.714 3.707a1.077 1.077 0 01-.538.127c-1.345 0-3.107-.96-4.888-2.622-1.78 1.654-3.542 2.603-4.887 2.603a1.077 1.077 0 01-.538-.127zm-2.35-4.09c-.37-.07-.748-.133-1.13-.186a23.98 23.98 0 01-1.35-.106 23.98 23.98 0 01-1.35.106 23.98 23.98 0 01-1.13.186c.11-.342.226-.685.352-1.024.126-.338.26-.672.4-1 .14.328.275.662.4 1 .126.339.243.682.352 1.024zM4.1 8.56c-.666.382-.955 1.835-.73 3.704.054.46.142.945.25 1.44a23.476 23.476 0 003.107-.534A23.892 23.892 0 0012 4.164c-.592.985-1.148 2.01-1.656 3.07a23.9 23.9 0 00-3.107.534 23.897 23.897 0 01-.244-1.416c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.638-.127z" /></svg>,
  },
  {
    name: 'Tailwind CSS', desc: 'Utility-first styling',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" /></svg>,
  },
];

const row2 = [
  {
    name: 'Node.js', desc: 'JS runtime',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.605.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.275 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.19-.137-.24l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.084.05-.139.142-.139.241v10.15c0 .097.055.189.137.236l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675a1.85 1.85 0 01-.919-1.604V6.921c0-.661.353-1.278.919-1.607l8.795-5.082c.552-.315 1.285-.315 1.833 0l8.794 5.082c.566.329.92.946.92 1.607v10.15c0 .659-.354 1.273-.92 1.604l-8.794 5.076c-.28.163-.601.247-.922.247zm2.718-6.993c-3.852 0-4.659-1.769-4.659-3.252 0-.142.114-.253.256-.253h1.138c.127 0 .233.092.252.217.172 1.161.684 1.747 3.016 1.747 1.857 0 2.645-.42 2.645-1.406 0-.568-.225-.99-3.116-1.273-2.416-.238-3.909-.773-3.909-2.706 0-1.784 1.503-2.845 4.023-2.845 2.829 0 4.228.981 4.404 3.088a.254.254 0 01-.065.196.255.255 0 01-.188.082h-1.142a.253.253 0 01-.248-.206c-.275-1.22-.943-1.611-2.762-1.611-2.034 0-2.27.708-2.27 1.239 0 .644.279.831 3.021 1.194 2.714.36 4.002.87 4.002 2.774-.003 1.929-1.609 3.011-4.398 3.011z" /></svg>,
  },
  {
    name: 'Express', desc: 'REST API backend',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z" /></svg>,
  },
  {
    name: 'PostgreSQL', desc: 'Neon serverless',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.128 0a10.134 10.134 0 00-2.755.403l-.063.02A10.922 10.922 0 0012.6.258C11.422.238 10.41.524 9.594 1 8.79.721 7.122.24 5.364.336 4.14.403 2.804.775 1.814 1.82.827 2.865.305 4.482.415 6.682c.03.607.203 1.597.49 2.879.284 1.271.657 2.68 1.102 3.861.223.59.453 1.078.681 1.429.228.349.487.608.796.608h.006c.306 0 .567-.25.793-.602.226-.352.449-.84.665-1.427.214-.586.42-1.273.614-1.99.19.36.38.677.573.96.22.326.44.6.66.817.22.217.44.38.66.49.22.11.44.165.66.165.22 0 .44-.055.66-.165.22-.11.44-.273.66-.49.22-.217.44-.491.66-.817.193-.283.383-.6.573-.96.194.717.4 1.404.614 1.99.216.587.439 1.075.665 1.427.226.352.487.602.793.602h.006c.309 0 .568-.259.796-.608.228-.351.458-.839.681-1.429.445-1.181.818-2.59 1.102-3.861.287-1.282.46-2.272.49-2.879.11-2.2-.412-3.817-1.399-4.862C19.496.775 18.16.403 16.936.336c-.12-.007-.24-.01-.36-.01zm.17 1.5c1.047.063 2.063.37 2.755 1.11.692.74 1.074 1.942.975 3.83-.027.524-.197 1.48-.476 2.733-.28 1.254-.648 2.626-1.075 3.757-.213.566-.42 1.02-.603 1.316-.182.295-.31.405-.378.42-.068-.015-.2-.124-.386-.42-.186-.295-.395-.75-.61-1.316-.428-1.131-.797-2.503-1.077-3.757-.28-1.253-.45-2.21-.476-2.733-.1-1.888.283-3.09.975-3.83.692-.74 1.708-1.047 2.755-1.11zm-10.9.336c1.047.063 2.063.37 2.755 1.11.692.74 1.074 1.942.975 3.83-.027.524-.197 1.48-.476 2.733-.28 1.254-.648 2.626-1.075 3.757-.213.566-.42 1.02-.603 1.316-.182.295-.31.405-.378.42-.068-.015-.2-.124-.386-.42-.186-.295-.395-.75-.61-1.316-.428-1.131-.797-2.503-1.077-3.757-.28-1.253-.45-2.21-.476-2.733-.1-1.888.283-3.09.975-3.83.692-.74 1.708-1.047 2.755-1.11z" /></svg>,
  },
  {
    name: 'Prisma', desc: 'Type-safe ORM',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21.807 18.285L13.553.756a1.324 1.324 0 00-1.129-.754 1.31 1.31 0 00-1.206.626l-9.997 16.503a1.316 1.316 0 00.027 1.367l4.866 7.467a1.315 1.315 0 001.109.607 1.328 1.328 0 00.375-.054l13.131-3.861a1.315 1.315 0 00.073-2.372zm-2.047 1.025l-11.44 3.367-4.24-6.503 8.713-14.38 6.967 17.516z" /></svg>,
  },
  {
    name: '@dnd-kit', desc: 'Drag & drop',
    logo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
  },
  {
    name: 'JWT + bcrypt', desc: 'Auth & security',
    logo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  },
  {
    name: 'Docker', desc: 'Containerized deploy',
    logo: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.184.185m24.932 1.618c-.086-.332-.237-.63-.43-.878-.197-.248-.44-.456-.717-.613a3.353 3.353 0 00-.934-.315 5.66 5.66 0 00-.16-1.099 4.277 4.277 0 00-.5-1.144 3.94 3.94 0 00-.823-.938 3.694 3.694 0 00-1.13-.596 4.47 4.47 0 00-1.4-.207c-.494 0-.97.074-1.412.22a4.128 4.128 0 00-1.18.63 4.16 4.16 0 00-.88 1.006 4.55 4.55 0 00-.52 1.36h-.056a2.918 2.918 0 00-1.12.224 2.82 2.82 0 00-.9.627 2.9 2.9 0 00-.596.942 3.14 3.14 0 00-.213 1.158c0 .418.08.82.236 1.195.156.376.38.71.657.99.278.28.608.502.977.658.37.155.77.234 1.19.234h9.342c.38 0 .743-.07 1.082-.21.34-.14.636-.337.882-.585.245-.248.438-.543.573-.874.135-.33.203-.686.203-1.054a2.87 2.87 0 00-.195-1.063" /></svg>,
  },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/boards');
  }, [user, router]);

  useReveal();

  if (user) return null;

  return (
    <div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-zinc-100">Kanban<span className="text-emerald-400">Flow</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition">Sign in</Link>
            <Link href="/register" className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition shadow-lg shadow-emerald-600/20">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-emerald-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-60 -right-60 w-[700px] h-[700px] bg-teal-600/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center w-full">
          <div className="reveal inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Visual project management for modern teams
          </div>

          <h1 className="reveal text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] tracking-tight mb-6">
            Organize work.<br />
            <span className="text-emerald-400">
              Ship faster.
            </span>
          </h1>

          <p className="reveal text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            KanbanFlow gives your team a shared visual workspace to plan, track, and deliver work — with drag-and-drop simplicity and real-time collaboration.
          </p>

          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="btn-border-spin w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium px-8 py-3.5 rounded-lg text-sm">
              Get started free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium px-8 py-3.5 rounded-lg text-sm transition">
              Sign in
            </Link>
          </div>

          {/* Mock board preview */}
          <div className="reveal mt-16 relative max-w-5xl mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="bg-zinc-900/60 backdrop-blur border border-zinc-700/50 rounded-lg p-3 sm:p-4 shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 border-b border-zinc-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70 shrink-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70 shrink-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 shrink-0" />
                <span className="text-xs text-zinc-500 ml-1 font-normal truncate">Product Roadmap — Q3 2025</span>
              </div>
              {/* Scrollable on mobile, grid on desktop */}
              <div className="flex gap-3 overflow-x-auto pb-1 sm:overflow-visible sm:grid sm:grid-cols-4 scrollbar-none">
                {[
                  { title: 'Backlog', color: 'bg-zinc-500', tasks: ['User auth flow', 'API rate limiting', 'Dark mode toggle'] },
                  { title: 'In Progress', color: 'bg-emerald-500', tasks: ['Drag & drop reorder', 'Board sharing UI'] },
                  { title: 'Review', color: 'bg-amber-500', tasks: ['Mobile responsive layout', 'Performance audit'] },
                  { title: 'Done', color: 'bg-teal-500', tasks: ['JWT authentication', 'Database schema', 'Docker setup'] },
                ].map(col => (
                  <div key={col.title} className="min-w-[160px] sm:min-w-0 bg-zinc-900 rounded-md border border-zinc-800 p-3 shrink-0 sm:shrink">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${col.color}`} />
                      <span className="text-xs font-medium text-zinc-300 truncate">{col.title}</span>
                      <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{col.tasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {col.tasks.map(t => (
                        <div key={t} className="bg-zinc-800 border border-zinc-700/50 rounded p-2.5">
                          <p className="text-xs text-zinc-300 font-normal leading-snug">{t}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-4 h-4 rounded bg-emerald-600/30 text-emerald-300 text-[9px] font-medium flex items-center justify-center shrink-0">{t[0]}</div>
                            <div className="h-1 flex-1 bg-zinc-700 rounded-full overflow-hidden">
                              <div className={`h-full ${col.color} opacity-60 rounded-full`} style={{ width: `${30 + (t.length * 3) % 60}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

{/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: heading + subtext + CTA */}
          <div className="reveal from-left">
            <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-snug mb-4">
              Everything your<br />team needs
            </h2>
            <p className="text-zinc-400 text-sm font-normal leading-relaxed mb-8 max-w-sm">
              A focused set of tools to keep your team aligned and your projects moving — without the bloat of enterprise software.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition">
              Start for free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Right: feature grid */}
          <div className="reveal from-right grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(f => (
              <div key={f.title}
                className="group bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-lg p-5 transition-all duration-200 cursor-default">
                <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/30 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-16">
            <p className="text-teal-400 text-xs font-medium uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Steps */}
            <div className="reveal from-left flex flex-col gap-8">
              {[
                {
                  step: '01',
                  title: 'Create an account',
                  desc: 'Register in seconds with your name and email. No credit card required.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Build your board',
                  desc: 'Create a board, add columns like To Do, In Progress, Done, and start adding tasks with priorities and due dates.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Invite your team',
                  desc: 'Share the board with teammates by email. They get instant access to collaborate in real time.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  ),
                },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    {i < arr.length - 1 && <div className="w-px flex-1 mt-3 bg-gradient-to-b from-emerald-500/20 to-transparent" />}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-emerald-500/60 tracking-widest">{s.step}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="reveal from-right relative">
              <div className="absolute -inset-4 bg-emerald-500/5 rounded-2xl blur-2xl" />
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <div className="flex-1 mx-3 bg-zinc-800 rounded px-3 py-1">
                    <span className="text-[10px] text-zinc-600 font-mono">kanbanflow.app/boards/my-project</span>
                  </div>
                </div>
                {/* Board header */}
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">My Project</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">3 columns · 7 tasks · by you</p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {['E', 'A', 'M'].map((l, i) => (
                      <div key={i} className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ring-1 ring-zinc-900 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>{l}</div>
                    ))}
                  </div>
                </div>
                {/* Columns */}
                <div className="p-3 flex gap-2.5 bg-zinc-950" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(63 63 70 / 0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                  {[
                    {
                      title: 'To Do', accent: 'bg-zinc-500', count: 3,
                      tasks: [
                        { text: 'Design system setup', priority: 'bg-sky-500', label: 'Design' },
                        { text: 'API documentation', priority: 'bg-zinc-500', label: 'Docs' },
                        { text: 'Write unit tests', priority: 'bg-amber-500', label: 'QA' },
                      ],
                    },
                    {
                      title: 'In Progress', accent: 'bg-emerald-500', count: 2,
                      tasks: [
                        { text: 'Auth flow implementation', priority: 'bg-red-500', label: 'Backend' },
                        { text: 'Dashboard UI', priority: 'bg-emerald-500', label: 'Frontend' },
                      ],
                    },
                    {
                      title: 'Done', accent: 'bg-teal-500', count: 2,
                      tasks: [
                        { text: 'Project scaffolding', priority: 'bg-zinc-500', label: 'Setup' },
                        { text: 'DB schema design', priority: 'bg-sky-500', label: 'Backend' },
                      ],
                    },
                  ].map(col => (
                    <div key={col.title} className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${col.accent}`} />
                        <span className="text-[10px] font-semibold text-zinc-400">{col.title}</span>
                        <span className="ml-auto text-[9px] text-zinc-600 bg-zinc-800 px-1 py-0.5 rounded">{col.count}</span>
                      </div>
                      <div className="space-y-1.5">
                        {col.tasks.map(t => (
                          <div key={t.text} className="bg-zinc-900 border border-zinc-800 rounded-md p-2">
                            <p className="text-[10px] text-zinc-300 leading-snug mb-1.5">{t.text}</p>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.priority}`} />
                              <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1 py-0.5 rounded">{t.label}</span>
                            </div>
                          </div>
                        ))}
                        {col.title === 'In Progress' && (
                          <div className="border border-dashed border-emerald-500/30 rounded-md p-2 flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-emerald-500/20 flex items-center justify-center">
                              <svg className="w-2 h-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="text-[9px] text-emerald-600">Add task</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="reveal text-center mb-14">
          <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Loved by teams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.name}
              className="reveal group bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-lg p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5 font-normal">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center">
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500 font-normal">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/30 py-20 overflow-hidden">
        <div className="reveal max-w-6xl mx-auto px-6 mb-12 text-center">
          <p className="text-teal-400 text-xs font-medium uppercase tracking-widest mb-3">Tech Stack</p>
          <h2 className="text-3xl font-semibold text-white tracking-tight">Built on modern foundations</h2>
        </div>

        {/* Row 1 — left */}
        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="flex">
            <div className="marquee-left flex gap-4 shrink-0">
              {[...row1, ...row1].map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-3.5 shrink-0">
                  <div className="w-7 h-7 flex items-center justify-center text-zinc-300">{t.logo}</div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-100 whitespace-nowrap">{t.name}</p>
                    <p className="text-[10px] text-zinc-500 whitespace-nowrap">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="flex">
            <div className="marquee-right flex gap-4 shrink-0">
              {[...row2, ...row2].map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-3.5 shrink-0">
                  <div className="w-7 h-7 flex items-center justify-center text-zinc-300">{t.logo}</div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-100 whitespace-nowrap">{t.name}</p>
                    <p className="text-[10px] text-zinc-500 whitespace-nowrap">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <div className="relative bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-12 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="reveal text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to get organized?
            </h2>
            <p className="reveal text-zinc-400 text-base mb-8 max-w-lg mx-auto font-normal">
              Join your team on KanbanFlow and start shipping work that matters.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-lg text-sm transition shadow-2xl shadow-emerald-600/25">
              Create free account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/60 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-100">Kanban<span className="text-emerald-400">Flow</span></span>
          </div>
          <p className="text-xs text-zinc-600 font-normal">© 2025 KanbanFlow. Built with Next.js, Express & PostgreSQL.</p>
          <div className="flex items-center gap-5 text-xs text-zinc-500">
            <Link href="/login" className="hover:text-zinc-300 transition">Sign in</Link>
            <Link href="/register" className="hover:text-zinc-300 transition">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
