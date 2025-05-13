<!-- frontend/src/routes/Register.svelte -->
<script lang="ts">
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { auth } from '../lib/firebase';
    import '../styles/auth.scss';
    import { navigate } from 'svelte-routing';
  
    let email: string = '';
    let password: string = '';
    let confirmPassword: string = '';
    let role: string = 'Customer';
    let loading: boolean = false;
    let error: string = '';
  
    async function handleRegister() {
      // Reset error message
      error = '';
      
      // Simple validation
      if (!email || !password || !confirmPassword) {
        error = 'All fields are required';
        return;
      }
      
      if (password !== confirmPassword) {
        error = 'Passwords do not match';
        return;
      }
      
      if (password.length < 6) {
        error = 'Password must be at least 6 characters';
        return;
      }
      
      try {
        loading = true;
        
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get the Firebase ID token for backend authentication
        const idToken = await user.getIdToken();
        
        // Store user role in Firestore via backend API
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            uid: user.uid,
            email: email,
            role: role
          })
        });
        
        if (!response.ok) {
          // If backend returns error, delete the auth user
          await user.delete();
          const data = await response.json();
          throw new Error(data.message || 'Failed to register user');
        }
        
        // Redirect to login page on successful registration
        navigate('/login', { replace: true });
      } catch (err) {
        if (err instanceof Error) {
          // Handle Firebase Auth specific errors
          if (err.message.includes('auth/email-already-in-use')) {
            error = 'Email is already in use';
          } else {
            error = err.message;
          }
        } else {
          error = 'An unexpected error occurred';
        }
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="auth-container">
    <h1>Register</h1>
    
    {#if error}
      <div class="error-message">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handleRegister}>
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          placeholder="Enter your password"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          bind:value={confirmPassword} 
          placeholder="Confirm your password"
          required
        />
      </div>
      
      <div class="role-selection">
        <label>Account Type</label>
        <div class="radio-group">
          <label>
            <input type="radio" bind:group={role} value="Customer" />
            Customer
          </label>
          <label>
            <input type="radio" bind:group={role} value="Seller" />
            Seller
          </label>
        </div>
      </div>
      
      <button type="submit" class="btn" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
    
    <div class="switch-form">
      Already have an account? <a href="/login">Login</a>
    </div>
  </div>