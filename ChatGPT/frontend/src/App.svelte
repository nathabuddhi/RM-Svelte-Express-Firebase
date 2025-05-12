<script lang="ts">
    import { Router, Route, Link } from "svelte-routing";
    import LoginPage from "./pages/login.svelte";
    import RegisterPage from "./pages/register.svelte";
    import SellerProducts from "./pages/seller-products.svelte";
    import BrowseProducts from "./pages/browse-products.svelte";
    import ProductDetail from "./pages/product-detail.svelte";
    import Cart from "./pages/cart.svelte";
</script>

<main>
    <Router>
        <Route path="/login">
            <LoginPage />
        </Route>
        <Route path="/login">
            <LoginPage />
        </Route>
        <Route path="/register">
            <RegisterPage />
        </Route>
        <Route path="/seller">
            <SellerProducts />
        </Route>
        <Route path="/customer">
            <BrowseProducts />
        </Route>
        <Route path="/cart">
            <Cart />
        </Route>
        <Route path="/product/:email/:productId">
            <ProductDetail />
        </Route>
    </Router>
</main>
