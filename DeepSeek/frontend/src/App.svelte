<script lang="ts">
    import svelteLogo from "./assets/svelte.svg";
    import viteLogo from "/vite.svg";
    import Counter from "./lib/Counter.svelte";
    import { Route, Router } from "svelte-routing";
    import Login from "./routes/Login.svelte";
    import Register from "./routes/Register.svelte";
    import ProductManagement from "./routes/product-management.svelte";
    import Search from "./routes/Search.svelte";
    import ProductDetail from "./routes/ProductDetail.svelte";
    import Cart from "./routes/Cart.svelte";
    import Checkout from "./routes/Checkout.svelte";
</script>

<Router>
    <Route path="/">
        <Counter />
    </Route>
    <Route path="/login">
        <Login />
    </Route>
    <Route path="/register">
        <Register />
    </Route>
    <Route path="/cart">
        <Cart />
    </Route>
    <Route path="/checkout">
        <Checkout />
    </Route>
    <Route path="/seller-dashboard">
        <ProductManagement />
    </Route>
    <Route path="/customer-dashboard">
        <Search />
    </Route>
    <Route path="/product/:id">
        <ProductDetail />
    </Route>
</Router>
