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
  initialBalance: number;
  referralCode: string;
}

interface Subadmin {
  id: string;
  name: string;
  referralCode: string;
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
  initialBalance?: number;
  referralCode?: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  isPaperTradeDefault?: boolean;
  isLearningMode?: boolean;
  referralCode?: string;
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
    initialBalance: 0,
    referralCode: "",
  });

  const [subadmins, setSubadmins] = useState<Subadmin[]>([]);

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    phoneNumber: "",
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /* ===========================
     Fetch User (Edit Mode)
  =========================== */

  useEffect(() => {
    if (isEdit && id) {
      fetchUser(id);
    }
    if (!isEdit && user?.role === "admin") {
      fetchSubadmins();
    }
  }, [id, isEdit, user?.role]);

  const fetchSubadmins = async () => {
    try {
      const response = await adminUsersService.getAll({ role: "SUBADMIN", limit: 100 });
      setSubadmins(response.items || []);
    } catch (error) {
      console.error("Failed to fetch subadmins", error);
    }
  };

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
        initialBalance: 0,
        referralCode: "",
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

    setApiError(null);
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
          initialBalance: Number(formData.initialBalance),
          referralCode: formData.referralCode,
        };

        await adminUsersService.create(payload);
        toast.success("User created successfully");
      }

      navigate(`${basePath}/users`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Something went wrong";
      if (error?.response?.status === 409) {
        setApiError(errorMessage);
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }))
        }
      } else {
        toast.error(errorMessage);
        setApiError(errorMessage);
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

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 mt-6 text-sm flex items-start gap-3">
          <div className="mt-0.5">⚠️</div>
          <div>
            <p className="font-bold">Submission Failed</p>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="ui-card p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="ui-input-group">
            <label className="ui-label">Full Name</label>
            <Input
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="ui-input"
            />
          </div>

          {/* Email */}
          <div className="ui-input-group">
            <label className="ui-label">Email Address</label>
            <Input
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="ui-input"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1 font-bold pl-1 animate-fade-in">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="ui-input-group">
            <label className="ui-label">Phone Number</label>
            <Input
              name="phoneNumber"
              placeholder="Enter 10-digit number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="ui-input"
            />
            {errors.phoneNumber && (
              <p className="text-destructive text-xs mt-1 font-bold pl-1 animate-fade-in">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Password */}
          {!isEdit && (
            <div className="ui-input-group">
              <label className="ui-label">Secure Password</label>
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="ui-input"
              />
            </div>
          )}

          {/* Initial Funding (Only on Create) */}
          {!isEdit && (
            <div className="ui-input-group">
              <label className="ui-label">Initial Balance (Paper Trading)</label>
              <Input
                name="initialBalance"
                type="number"
                placeholder="0.00"
                value={formData.initialBalance}
                onChange={handleChange}
                className="ui-input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Starting funds for paper trading wallet</p>
            </div>
          )}

          {/* Assigned Subadmin (Only on Create & if Admin) */}
          {!isEdit && user?.role === "admin" && (
            <div className="ui-input-group">
              <label className="ui-label">Assign to Subadmin</label>
              <select
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="ui-input h-10 px-3 bg-background border border-input rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- No Subadmin (System Default) --</option>
                {subadmins.map((sa) => (
                  <option key={sa.referralCode} value={sa.referralCode}>
                    {sa.name} ({sa.referralCode})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1 text-primary">Assign this user to a specific subadmin counselor</p>
            </div>
          )}
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