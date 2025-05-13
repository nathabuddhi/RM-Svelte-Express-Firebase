<!-- frontend/src/App.svelte -->
<script lang="ts">
    import { Router, Route } from "svelte-routing";
    import Register from "./pages/Register.svelte";
    import Login from "./pages/Login.svelte";
    import SellerDashboard from "./pages/SellerDashboard.svelte";
    import ProductSearch from "./pages/ProductSearch.svelte";
    import ProductDetail from "./pages/ProductDetail.svelte";
    import Cart from "./pages/Cart.svelte";

    export let url = "";
</script>

<Router {url}>
    <div>
        <Route path="/register"><Register /></Route>
        <Route path="/login"><Login /></Route>
        <!-- Add placeholder routes for now -->
        <Route path="/customer/dashboard"><ProductSearch /></Route>
        <Route path="/product/:id" let:params
            ><ProductDetail id={params.id} /></Route
        >
        <Route path="/seller/dashboard"><SellerDashboard /></Route>
        <Route path="/cart"><Cart /></Route>
    </div>
</Router>
