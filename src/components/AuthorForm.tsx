import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import authorService from '../services/author.service';
import type { Author, AuthorRole } from '../models';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  nationality: string;
  website: string;
  active: boolean;
  role: AuthorRole;
}

const emptyForm: FormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  nationality: '',
  website: '',
  active: true,
  role: 'author',
};


const validate = (v: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!v.name.trim()) errors.name = 'El nombre es obligatorio';
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.email = 'Introduce un email válido';
  if (v.password.length < 8) errors.password = 'Mínimo 8 caracteres';
  if (v.confirmPassword !== v.password) errors.confirmPassword = 'Las contraseñas no coinciden';
  if (v.website && !/^https?:\/\/\S+$/.test(v.website)) {
    errors.website = 'Tiene que empezar por http:// o https://';
  }
  return errors;
};

export default function AuthorForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const errors = validate(values);
 
  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const fillForm = (author: Author) => {
    setValues({
      ...emptyForm,
      name: author.name,
      email: author.email,
      birthDate: author.birthDate?.slice(0, 10) ?? '',
      nationality: author.nationality ?? '',
      website: author.website ?? '',
      active: author.active ?? true,
      role: author.role ?? 'author',
    });
  };

  useEffect(() => {
    if (!id) return;

    const fromState: Author | undefined = location.state?.author;
    if (fromState?._id === id) {
      fillForm(fromState);
      return;
    }
    setLoading(true);
    authorService
      .get<{ author: Author }>(id)
      .then((res) => fillForm(res.data.author))
      .catch((err) => {
        setError(err.response?.data?.message ?? err.message);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;

    const payload: Record<string, unknown> = { ...values };
    delete payload.confirmPassword;

    const author = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== ''));

    const request = id ? authorService.update(id, author) : authorService.create(author);

    setSaving(true);
    setError('');
    request
      .then(() => navigate('/authors', { replace: true }))
      .catch((err) => {
        setError(err.response?.data?.message ?? err.message);
        setSaving(false);
      });
  };

  if (loading) return <p className="muted">Cargando...</p>;

  if (loadFailed) {
    return (
      <>
        <p className="alert-bo">{error}</p>
        <Link to="/authors">Volver a la lista de autores</Link>
      </>
    );
  }

  return (
    <div>
      <h1>{id ? 'Editar autor' : 'Nuevo autor'}</h1>

      {error && <p className="alert-bo">{error}</p>}

      <form className="form-bo" onSubmit={handleSubmit}>
        <label>
          Nombre *
          <input value={values.name} onChange={(e) => setField('name', e.target.value)} />
          {showErrors && errors.name && <small className="field-error">{errors.name}</small>}
        </label>

        <label>
          Email *
          <input
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
          />
          {showErrors && errors.email && <small className="field-error">{errors.email}</small>}
        </label>

        <label>
          Contraseña *
          <input
            type="password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
          />
          {showErrors && errors.password && (
            <small className="field-error">{errors.password}</small>
          )}
        </label>

        <label>
          Repite la contraseña *
          <input
            type="password"
            value={values.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
          />
          {showErrors && errors.confirmPassword && (
            <small className="field-error">{errors.confirmPassword}</small>
          )}
        </label>

        <label>
          Fecha de nacimiento
          <input
            type="date"
            value={values.birthDate}
            onChange={(e) => setField('birthDate', e.target.value)}
          />
        </label>

        <label>
          Nacionalidad
          <input
            value={values.nationality}
            onChange={(e) => setField('nationality', e.target.value)}
          />
        </label>

        <label>
          Web
          <input value={values.website} onChange={(e) => setField('website', e.target.value)} />
          {showErrors && errors.website && (
            <small className="field-error">{errors.website}</small>
          )}
        </label>

        <label>
          Rol
          <select
            value={values.role}
            onChange={(e) => setField('role', e.target.value as AuthorRole)}
          >
            <option value="author">Author</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => setField('active', e.target.checked)}
          />
          Activo
        </label>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/authors">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}