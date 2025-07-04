import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const EmailTemplatePreview = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      const res = await axios.get(`${API_BASE}/email-templates/${id}`);
      setTemplate(res.data);
    };
    fetchTemplate();
  }, [id]);

  if (!template) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: template.content }}
      />
    </div>
  );
};

export default EmailTemplatePreview;
