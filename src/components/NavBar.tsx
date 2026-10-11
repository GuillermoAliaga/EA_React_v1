import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar-bo">
      <NavLink to="/authors">Autores</NavLink>
      <NavLink to="/books">Libros</NavLink>
    </nav>
  );
}