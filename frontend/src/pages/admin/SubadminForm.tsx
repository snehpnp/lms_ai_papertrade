import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { adminUsersService } from "@/services/admin.users.service";

type UserRole = "SUBADMIN";

const SubadminForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit: boolean = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "SUBADMIN" as UserRole,
  });

  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) fetchUser(id);
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      const data = await adminUsersService.getById(userId);
      setFormData({
        name: data.name ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        password: "",
        role: "SUBADMIN",
      });
    } catch (error) {
      toast.error("Failed to fetch subadmin");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      const emailTypingRegex = /^[a-zA-Z0-9@._-]*$/;
      if (emailTypingRegex.test(value)) {
        setFormData((prev) => ({ ...prev, email: value }));
        const emailFullRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setErrors((prev) => ({ ...prev, email: value && !emailFullRegex.test(value) ? "Invalid email" : "" }));
      }
    } else if (name === "phoneNumber") {
      const phoneRegex = /^\d{0,10}$/;
      if (phoneRegex.test(value)) {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
        setErrors((prev) => ({ ...prev, phoneNumber: value.length === 10 ? "" : "Phone must be 10 digits" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegexFull = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegexFull = /^\d{10}$/;

    if (!emailRegexFull.test(formData.email)) return toast.error("Please enter a valid email address");
    if (!phoneRegexFull.test(formData.phoneNumber)) return toast.error("Phone number must be exactly 10 digits");
    if (!isEdit && !formData.password) return toast.error("Password is required");

    setLoading(true);
    try {
      if (isEdit && id) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;
        await adminUsersService.update(id, payload);
        toast.success("SubAdmin updated successfully");
      } else {
        await adminUsersService.create({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
        });
        toast.success("SubAdmin created successfully");
      }
      navigate("/admin/subadmins");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/admin/subadmins" className="inline-flex items-center gap-1.5 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to SubAdmins
      </Link>
      <PageHeader title={isEdit ? "Edit SubAdmin" : "Add SubAdmin"} subtitle={isEdit ? "Update subadmin details" : "Create a new platform subadmin"} />
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Full Name</label>
            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Email</label>
            <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Phone Number</label>
            <Input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          {!isEdit && (
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Password</label>
              <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-8">
          <Button type="submit" disabled={loading}>{loading ? "Please wait..." : isEdit ? "Update" : "Create"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/subadmins")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default SubadminForm;
