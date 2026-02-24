import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, CandlestickChart, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { adminUsersService } from "@/services/admin.users.service";
import { useAuth } from "@/contexts/AuthContext";

/* ===========================
   Types
=========================== */

type UserRole = "USER" | "SUBADMIN" | "ADMIN";

interface UserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  isPaperTradeDefault: boolean;
  isLearningMode: boolean;
}

interface FormErrors {
  email: string;
  phoneNumber: string;
}

interface UpdateUserPayload {
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  password?: string;
  isPaperTradeDefault: boolean;
  isLearningMode: boolean;
}

interface CreateUserPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  isPaperTradeDefault: boolean;
  isLearningMode: boolean;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  isPaperTradeDefault?: boolean;
  isLearningMode?: boolean;
}

/* ===========================
   Component
=========================== */

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit: boolean = Boolean(id);
  const { user } = useAuth();
  const basePath = `/${user?.role || "admin"}`;

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "USER",
    isPaperTradeDefault: true,
    isLearningMode: false,
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  /* ===========================
     Fetch User (Edit Mode)
  =========================== */

  useEffect(() => {
    if (isEdit && id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string): Promise<void> => {
    try {
      const data: UserResponse = await adminUsersService.getById(userId);

      setFormData({
        name: data.name ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        password: "",
        role: data.role ?? "USER",
        isPaperTradeDefault: data.isPaperTradeDefault ?? true,
        isLearningMode: data.isLearningMode ?? false,
      });
    } catch (error) {
      toast.error("Failed to fetch user");
    }
  };

  /* ===========================
     Input Change Handler
  =========================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;

    if (name === "email") {
      const emailTypingRegex = /^[a-zA-Z0-9@._-]*$/;

      if (emailTypingRegex.test(value)) {
        setFormData((prev) => ({ ...prev, email: value }));

        const emailFullRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        setErrors((prev) => ({
          ...prev,
          email:
            value && !emailFullRegex.test(value)
              ? "Invalid email"
              : "",
        }));
      }
    } else if (name === "phoneNumber") {
      const phoneRegex = /^\d{0,10}$/;

      if (phoneRegex.test(value)) {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));

        setErrors((prev) => ({
          ...prev,
          phoneNumber:
            value.length === 10 ? "" : "Phone must be 10 digits",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* ===========================
     Submit Handler
  =========================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const emailRegexFull = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegexFull = /^\d{10}$/;

    if (!emailRegexFull.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!phoneRegexFull.test(formData.phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (!isEdit && !formData.password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      if (isEdit && id) {
        const payload: UpdateUserPayload = {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          isPaperTradeDefault: formData.isPaperTradeDefault,
          isLearningMode: formData.isLearningMode,
        };

        if (formData.password) {
          payload.password = formData.password;
        }

        await adminUsersService.update(id, payload);
        toast.success("User updated successfully");
      } else {
        const payload: CreateUserPayload = {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
          isPaperTradeDefault: formData.isPaperTradeDefault,
          isLearningMode: formData.isLearningMode,
        };

        await adminUsersService.create(payload);
        toast.success("User created successfully");
      }

      navigate(`${basePath}/users`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div>
      <Link
        to={`${basePath}/users`}
        className="inline-flex items-center gap-1.5 text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <PageHeader
        title={isEdit ? "Edit User" : "Add User"}
        subtitle={
          isEdit
            ? "Update user details"
            : "Create a new platform user"
        }
      />

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl border p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">
              Email
            </label>
            <Input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">
              Phone Number
            </label>
            <Input
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Password */}
          {!isEdit && (
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">
                Password
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>

        {/* ===========================
           Mode Toggles
        =========================== */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            User Mode Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paper Trade Default Toggle */}
            <div
              className={`relative flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                formData.isPaperTradeDefault
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                    formData.isPaperTradeDefault
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CandlestickChart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Paper Trade Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable default paper trading for this user
                  </p>
                </div>
              </div>
              <Switch
                id="isPaperTradeDefault"
                checked={formData.isPaperTradeDefault}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPaperTradeDefault: checked,
                  }))
                }
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {/* Learning Mode Toggle */}
            <div
              className={`relative flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                formData.isLearningMode
                  ? "border-blue-500/40 bg-blue-500/5"
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                    formData.isLearningMode
                      ? "bg-blue-500/15 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Learning Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable guided learning mode for this user
                  </p>
                </div>
              </div>
              <Switch
                id="isLearningMode"
                checked={formData.isLearningMode}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isLearningMode: checked,
                  }))
                }
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-8">
          <Button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isEdit
              ? "Update User"
              : "Create User"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`${basePath}/users`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;