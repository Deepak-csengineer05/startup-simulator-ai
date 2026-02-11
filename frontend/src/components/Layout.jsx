import Navbar from './Navbar';

function Layout({ children }) {
    return (
        <div
            className="min-h-screen"
            style={{ background: 'var(--color-bg-primary)', paddingTop: '4rem' }}
        >
            <Navbar/>
            <main>
                {children}
            </main>
        </div>
    );
}

export default Layout;
