import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import AuthorList from './components/AuthorList';
import BookList from './components/BookList';
import AuthorForm from './components/AuthorForm';
import BookForm from './components/BookForm';

function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/authors" replace />} />
          <Route path="/authors" element={<AuthorList />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/authors/new" element={<AuthorForm />} />
<Route path="/authors/:id/edit" element={<AuthorForm />} />
          <Route path="/books/new" element={<BookForm />} />
          <Route path="/books/:id/edit" element={<BookForm />} />
        </Routes>
      </main>
    </>
  );
}

export default App;