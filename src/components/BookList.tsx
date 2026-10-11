import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../services/book.service';
import { CanceledError } from '../services/api-client';
import type { Book } from '../models';

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { request, cancel } = bookService.getAll<{ books: Book[] }>();

    request
      .then((res) => {
        setBooks(res.data.books);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;

        setError(err.response?.data?.message ?? err.message);
        setLoading(false);
      });

    return () => cancel();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Libros</h1>
        <Link to="/books/new">Nuevo libro</Link>
      </div>

      {error && <p className="alert-box">{error}</p>}
      {loading && <p className="muted">Cargando...</p>}

      {!loading && !error && (
        <table className="table-bo">
          <thead>
            <tr>
              <th>Título</th>
              <th>Editorial</th>
              <th>Autores</th>
              <th>Año</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.publisher ?? '—'}</td>
                <td>
                  {book.authors.length > 0
                    ? book.authors
                        .map((author) =>
                          typeof author === 'string'
                            ? author
                            : author.name,
                        )
                        .join(', ')
                    : 'Sin autores'}
                </td>
                <td>{book.publishedYear ?? '—'}</td>
                <td>
                  <Link to={`/books/${book._id}/edit`}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}

            {books.length === 0 && (
              <tr>
                <td colSpan={5}>No hay libros</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
