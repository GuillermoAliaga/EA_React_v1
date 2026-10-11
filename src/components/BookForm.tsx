import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import bookService from '../services/book.service';
import authorService from '../services/author.service';
import type {
  Author,
  Book,
  BookLanguage,
  CreateBook,
} from '../models';
import { BOOK_LANGUAGES, BOOK_TAGS } from '../models';

interface FormValues {
  title: string;
  isbn: string;
  authors: string[];
  description: string;
  publishedYear: string;
  pages: string;
  language: BookLanguage;
  tags: string[];
  price: string;
}

const emptyForm: FormValues = {
  title: '',
  isbn: '',
  authors: [],
  description: '',
  publishedYear: '',
  pages: '',
  language: 'es',
  tags: [],
  price: '',
};

const validate = (v: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!v.title.trim()) {
    errors.title = 'El título es obligatorio';
  }

  if (!v.isbn.trim()) {
    errors.isbn = 'El ISBN es obligatorio';
  }

  if (v.authors.length === 0) {
    errors.authors = 'Selecciona al menos un autor';
  }

  if (v.publishedYear) {
    const year = Number(v.publishedYear);

    if (!Number.isInteger(year) || year < 1450 || year > 2100) {
      errors.publishedYear = 'El año debe estar entre 1450 y 2100';
    }
  }

  if (v.pages) {
    const pages = Number(v.pages);

    if (!Number.isInteger(pages) || pages < 1) {
      errors.pages = 'Las páginas deben ser un entero positivo';
    }
  }

  if (v.price) {
    const price = Number(v.price);

    if (!Number.isFinite(price) || price < 0) {
      errors.price = 'El precio no puede ser negativo';
    }
  }

  return errors;
};

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const errors = validate(values);

  const setField = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const fillForm = (book: Book) => {
    setValues({
      title: book.title,
      isbn: book.isbn,
      authors: book.authors.map((author) =>
        typeof author === 'string' ? author : author._id,
      ),
      description: book.description ?? '',
      publishedYear: book.publishedYear?.toString() ?? '',
      pages: book.pages?.toString() ?? '',
      language: book.language ?? 'es',
      tags: book.tags ?? [],
      price: book.price?.toString() ?? '',
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadAuthors = async () => {
      try {
        const { request } =
          authorService.getAll<{ authors: Author[] }>();

        const response = await request;

        if (!cancelled) {
          setAuthors(response.data.authors);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ??
              err.message ??
              'Error al cargar autores',
          );
        }
      }
    };

    const loadBook = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const response = await bookService.get<{ book: Book }>(id);

        if (!cancelled) {
          fillForm(response.data.book);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ??
              err.message ??
              'Error al cargar el libro',
          );
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAuthors();
    void loadBook();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (Object.keys(errors).length > 0) return;

    const payload: CreateBook = {
      title: values.title.trim(),
      isbn: values.isbn.trim(),
      authors: values.authors,
      description: values.description,
      publishedYear: values.publishedYear
        ? Number(values.publishedYear)
        : undefined,
      pages: values.pages ? Number(values.pages) : undefined,
      language: values.language,
      tags: values.tags,
      price: values.price ? Number(values.price) : undefined,
    };

    const book = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== '' && value !== undefined,
      ),
    );

    setSaving(true);
    setError('');

    try {
      if (id) {
        await bookService.update(id, book);
      } else {
        await bookService.create(book);
      }

      navigate('/books', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          err.message ??
          'Error al guardar el libro',
      );
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="muted">Cargando...</p>;
  }

  if (loadFailed) {
    return (
      <>
        <p className="alert-bo">{error}</p>
        <Link to="/books">Volver a la lista de libros</Link>
      </>
    );
  }

  return (
    <div>
      <h1>{id ? 'Editar libro' : 'Nuevo libro'}</h1>

      {error && <p className="alert-bo">{error}</p>}

      <form className="form-bo" onSubmit={handleSubmit}>
        <label>
          Título *
          <input
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          {showErrors && errors.title && (
            <small className="field-error">{errors.title}</small>
          )}
        </label>

        <label>
          ISBN *
          <input
            value={values.isbn}
            onChange={(e) => setField('isbn', e.target.value)}
          />
          {showErrors && errors.isbn && (
            <small className="field-error">{errors.isbn}</small>
          )}
        </label>

        <label>
          Autores *
          <select
            multiple
            value={values.authors}
            onChange={(e) =>
              setField(
                'authors',
                Array.from(
                  e.target.selectedOptions,
                  (option) => option.value,
                ),
              )
            }
          >
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
          {showErrors && errors.authors && (
            <small className="field-error">{errors.authors}</small>
          )}
        </label>

        <label>
          Descripción
          <textarea
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </label>

        <label>
          Año de publicación
          <input
            type="number"
            value={values.publishedYear}
            onChange={(e) =>
              setField('publishedYear', e.target.value)
            }
          />
          {showErrors && errors.publishedYear && (
            <small className="field-error">
              {errors.publishedYear}
            </small>
          )}
        </label>

        <label>
          Páginas
          <input
            type="number"
            value={values.pages}
            onChange={(e) => setField('pages', e.target.value)}
          />
          {showErrors && errors.pages && (
            <small className="field-error">{errors.pages}</small>
          )}
        </label>

        <label>
          Idioma
          <select
            value={values.language}
            onChange={(e) =>
              setField('language', e.target.value as BookLanguage)
            }
          >
            {BOOK_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label>
          Etiquetas
          <select
            multiple
            value={values.tags}
            onChange={(e) =>
              setField(
                'tags',
                Array.from(
                  e.target.selectedOptions,
                  (option) => option.value,
                ),
              )
            }
          >
            {BOOK_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label>
          Precio
          <input
            type="number"
            min="0"
            step="any"
            value={values.price}
            onChange={(e) => setField('price', e.target.value)}
          />
          {showErrors && errors.price && (
            <small className="field-error">{errors.price}</small>
          )}
        </label>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/books">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
