/**
 * Layout Component
 * 
 * A wrapper component that provides the main application layout structure.
 * Implements a sticky header, flexible main content area, and footer using
 * a flex column layout that ensures the footer stays at the bottom.
 * 
 * @component
 * 
 * Key Features:
 * - Consistent layout across all pages
 * - Sticky navigation header
 * - Flexible content area
 * - Footer always at bottom
 * - Responsive design
 * 
 * Integration Points:
 * 1. React Router:
 *    - Uses Outlet for dynamic page content
 *    - Maintains layout during route changes
 * 
 * 2. Child Components:
 *    - Navbar: Global navigation
 *    - Footer: Page information and links
 *    - Outlet: Dynamic page content
 * 
 * Layout Structure:
 * ```
 * <div min-h-screen>
 *   <Navbar />        // Sticky top navigation
 *   <main>           // Flexible content area
 *     <Outlet />     // Page-specific content
 *   </main>
 *   <Footer />       // Sticky footer
 * </div>
 * ```
 * 
 * Data Flow:
 * 1. Route Change:
 *    - React Router updates current route
 *    - Outlet renders new page content
 *    - Layout maintains consistent structure
 * 
 * 2. Responsive Behavior:
 *    - Adapts to screen sizes
 *    - Maintains min-height
 *    - Preserves footer positioning
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import Layout from './components/Layout';
 * import Home from './pages/Home';
 * import TodoList from './pages/TodoList';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         <Route path="/" element={<Layout />}>
 *           <Route index element={<Home />} />
 *           <Route path="todos" element={<TodoList />} />
 *         </Route>
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 * ```
 * 
 * @see {@link Navbar} For the navigation component
 * @see {@link Footer} For the footer component
 * @see {@link App} For the routing setup
 */