import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin user thật
    const [loading, setLoading] = useState(true);

    // Mock dữ liệu đăng nhập để làm FE trước (Khi có BE Login thật sẽ thay thế chỗ này)
    useEffect(() => {
        const fakeUser = JSON.parse(localStorage.getItem('user'));
        if (fakeUser) {
            setUser(fakeUser);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Trong thực tế, userData sẽ chứa JWT Token và info user
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // Kiểm tra xem User có quyền truy cập không dựa trên Role
    const hasRole = (roles) => {
        return user && roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);