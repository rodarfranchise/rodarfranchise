import Navbar from './Navbar';
import logo from '../../assets/rodar_light.png';

export default function Header() {
  const items = [
    {
      label: 'Browse',
      bgColor: '#8b2121ff',
      textColor: '#fff',
      links: [
        { label: 'Home', href: '/', ariaLabel: 'Go to Home' },
        { label: 'Franchises', href: '/search', ariaLabel: 'Browse Franchises' },,
      ],
    },
    {
      label: 'About',
      bgColor: '#751616ff',
      textColor: '#fff',
      links: [
        { label: 'Company', href: '/about', ariaLabel: 'About Company' },
        { label: 'Gallery', href: '/gallery', ariaLabel: 'Gallery' },
        { label: 'How it Works', href: '/about#how-it-works', ariaLabel: 'How it Works' },
      ],
    },
    {
      label: 'Contact',
      bgColor: '#4e0a0aff',
      textColor: '#fff',
      links: [
        { label: 'Get in Touch', href: '/contact', ariaLabel: 'Contact Us' },
      ],
    },
  ];

  return (
    <Navbar logo={logo} logoAlt="Rodar Franchise World Logo" items={items} />
  );
}
