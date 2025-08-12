// Advanced Machine Learning Recommendation Engine
class MLRecommendationEngine {
  constructor() {
    this.userProfiles = new Map();
    this.productData = new Map();
    this.interactionMatrix = new Map();
    this.contentFeatures = new Map();
    this.collaborativeModel = null;
    this.contentModel = null;
    this.hybridWeights = { collaborative: 0.6, content: 0.4 };
    this.init();
  }

  init() {
    this.loadData();
    this.buildUserProfiles();
    this.extractContentFeatures();
    this.trainModels();
    this.createRecommendationInterface();
  }

  loadData() {
    // Simulated product data with detailed features
    const products = [
      {
        id: 1, name: 'Hydrating Cleanser', category: 'cleanser', price: 24.99,
        ingredients: ['hyaluronic acid', 'ceramides', 'glycerin'],
        skinTypes: ['dry', 'sensitive'], concerns: ['dryness', 'irritation'],
        texture: 'cream', spf: 0, rating: 4.5, reviews: 245
      },
      {
        id: 2, name: 'Vitamin C Serum', category: 'serum', price: 34.99,
        ingredients: ['vitamin c', 'vitamin e', 'ferulic acid'],
        skinTypes: ['all'], concerns: ['dullness', 'aging', 'dark spots'],
        texture: 'liquid', spf: 0, rating: 4.7, reviews: 189
      },
      {
        id: 3, name: 'SPF 30 Sunscreen', category: 'sunscreen', price: 22.99,
        ingredients: ['zinc oxide', 'titanium dioxide'],
        skinTypes: ['all'], concerns: ['sun protection'],
        texture: 'cream', spf: 30, rating: 4.3, reviews: 156
      },
      {
        id: 4, name: 'Niacinamide Serum', category: 'serum', price: 19.99,
        ingredients: ['niacinamide', 'zinc', 'hyaluronic acid'],
        skinTypes: ['oily', 'combination'], concerns: ['pores', 'oiliness'],
        texture: 'gel', spf: 0, rating: 4.6, reviews: 302
      },
      {
        id: 5, name: 'Retinol Night Cream', category: 'moisturizer', price: 45.99,
        ingredients: ['retinol', 'peptides', 'shea butter'],
        skinTypes: ['mature', 'normal'], concerns: ['aging', 'wrinkles'],
        texture: 'cream', spf: 0, rating: 4.4, reviews: 128
      },
      {
        id: 6, name: 'Gentle Toner', category: 'toner', price: 18.99,
        ingredients: ['rose water', 'aloe vera', 'witch hazel'],
        skinTypes: ['sensitive', 'all'], concerns: ['irritation', 'balance'],
        texture: 'liquid', spf: 0, rating: 4.2, reviews: 97
      },
      {
        id: 7, name: 'Eye Cream', category: 'eye-care', price: 29.99,
        ingredients: ['caffeine', 'peptides', 'vitamin k'],
        skinTypes: ['all'], concerns: ['dark circles', 'puffiness'],
        texture: 'cream', spf: 0, rating: 4.1, reviews: 78
      },
      {
        id: 8, name: 'Face Oil', category: 'oil', price: 39.99,
        ingredients: ['jojoba oil', 'rosehip oil', 'vitamin e'],
        skinTypes: ['dry', 'mature'], concerns: ['dryness', 'aging'],
        texture: 'oil', spf: 0, rating: 4.8, reviews: 156
      }
    ];

    products.forEach(product => {
      this.productData.set(product.id, product);
    });

    // Load user interaction data from localStorage or generate sample data
    this.loadUserInteractions();
  }

  loadUserInteractions() {
    // Try to load from localStorage first
    const storedInteractions = localStorage.getItem('userInteractions');
    if (storedInteractions) {
      const interactions = JSON.parse(storedInteractions);
      interactions.forEach(interaction => {
        const key = `${interaction.userId}-${interaction.productId}`;
        this.interactionMatrix.set(key, interaction);
      });
      return;
    }

    // Generate sample user interactions for demonstration
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal'][Math.floor(Math.random() * 5)],
      concerns: this.getRandomConcerns(),
      age: Math.floor(Math.random() * 40) + 20,
      budget: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));

    users.forEach(user => {
      this.userProfiles.set(user.id, user);
      
      // Generate random interactions
      const numInteractions = Math.floor(Math.random() * 8) + 2;
      const productIds = Array.from(this.productData.keys());
      
      for (let i = 0; i < numInteractions; i++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const product = this.productData.get(productId);
        
        // Calculate interaction score based on compatibility
        let score = this.calculateCompatibilityScore(user, product);
        score += (Math.random() - 0.5) * 2; // Add some randomness
        score = Math.max(1, Math.min(5, score));

        const interaction = {
          userId: user.id,
          productId: productId,
          rating: Math.round(score),
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          type: ['view', 'purchase', 'cart', 'wishlist'][Math.floor(Math.random() * 4)],
          timeSpent: Math.floor(Math.random() * 300) + 30 // seconds
        };

        const key = `${user.id}-${productId}`;
        this.interactionMatrix.set(key, interaction);
      }
    });

    // Save to localStorage
    this.saveInteractions();
  }

  getRandomConcerns() {
    const allConcerns = ['dryness', 'oiliness', 'aging', 'acne', 'sensitivity', 'dark spots', 'wrinkles', 'pores'];
    const numConcerns = Math.floor(Math.random() * 3) + 1;
    const shuffled = allConcerns.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numConcerns);
  }

  calculateCompatibilityScore(user, product) {
    let score = 3; // Base score

    // Skin type compatibility
    if (product.skinTypes.includes(user.skinType) || product.skinTypes.includes('all')) {
      score += 1;
    }

    // Concern compatibility
    const concernMatch = user.concerns.some(concern => product.concerns.includes(concern));
    if (concernMatch) {
      score += 1;
    }

    // Age-based preferences
    if (user.age > 35 && product.concerns.includes('aging')) {
      score += 0.5;
    }

    return score;
  }

  buildUserProfiles() {
    // Enhanced user profiling based on interactions
    this.interactionMatrix.forEach((interaction, key) => {
      const user = this.userProfiles.get(interaction.userId);
      if (user) {
        if (!user.preferences) {
          user.preferences = {
            categories: new Map(),
            ingredients: new Map(),
            priceRange: { min: Infinity, max: 0 },
            averageRating: 0,
            totalInteractions: 0
          };
        }

        const product = this.productData.get(interaction.productId);
        if (product) {
          // Update category preferences
          const currentCatScore = user.preferences.categories.get(product.category) || 0;
          user.preferences.categories.set(product.category, currentCatScore + interaction.rating);

          // Update ingredient preferences
          product.ingredients.forEach(ingredient => {
            const currentIngScore = user.preferences.ingredients.get(ingredient) || 0;
            user.preferences.ingredients.set(ingredient, currentIngScore + interaction.rating * 0.5);
          });

          // Update price range
          user.preferences.priceRange.min = Math.min(user.preferences.priceRange.min, product.price);
          user.preferences.priceRange.max = Math.max(user.preferences.priceRange.max, product.price);

          // Update average rating
          user.preferences.totalInteractions++;
          user.preferences.averageRating = 
            (user.preferences.averageRating * (user.preferences.totalInteractions - 1) + interaction.rating) / 
            user.preferences.totalInteractions;
        }
      }
    });
  }

  extractContentFeatures() {
    // Extract and normalize content features for content-based filtering
    this.productData.forEach((product, productId) => {
      const features = {
        categoryVector: this.createCategoryVector(product.category),
        ingredientVector: this.createIngredientVector(product.ingredients),
        skinTypeVector: this.createSkinTypeVector(product.skinTypes),
        concernVector: this.createConcernVector(product.concerns),
        priceNormalized: this.normalizePrice(product.price),
        ratingNormalized: product.rating / 5,
        textureVector: this.createTextureVector(product.texture),
        spfNormalized: product.spf / 50
      };

      this.contentFeatures.set(productId, features);
    });
  }

  createCategoryVector(category) {
    const categories = ['cleanser', 'serum', 'moisturizer', 'sunscreen', 'toner', 'eye-care', 'oil'];
    return categories.map(cat => cat === category ? 1 : 0);
  }

  createIngredientVector(ingredients) {
    const allIngredients = ['hyaluronic acid', 'vitamin c', 'retinol', 'niacinamide', 'ceramides', 'peptides', 'zinc oxide', 'salicylic acid'];
    return allIngredients.map(ing => ingredients.some(i => i.includes(ing)) ? 1 : 0);
  }

  createSkinTypeVector(skinTypes) {
    const types = ['dry', 'oily', 'combination', 'sensitive', 'normal', 'mature', 'all'];
    return types.map(type => skinTypes.includes(type) ? 1 : 0);
  }

  createConcernVector(concerns) {
    const allConcerns = ['dryness', 'oiliness', 'aging', 'acne', 'sensitivity', 'dark spots', 'wrinkles', 'pores'];
    return allConcerns.map(concern => concerns.includes(concern) ? 1 : 0);
  }

  createTextureVector(texture) {
    const textures = ['cream', 'gel', 'liquid', 'oil', 'foam'];
    return textures.map(tex => tex === texture ? 1 : 0);
  }

  normalizePrice(price) {
    const minPrice = 15;
    const maxPrice = 50;
    return (price - minPrice) / (maxPrice - minPrice);
  }

  trainModels() {
    this.trainCollaborativeFiltering();
    this.trainContentBasedFiltering();
  }

  trainCollaborativeFiltering() {
    // Simplified collaborative filtering using user-item matrix
    this.collaborativeModel = {
      userSimilarity: new Map(),
      itemSimilarity: new Map()
    };

    // Calculate user similarities
    const users = Array.from(this.userProfiles.keys());
    users.forEach(userId1 => {
      users.forEach(userId2 => {
        if (userId1 !== userId2) {
          const similarity = this.calculateUserSimilarity(userId1, userId2);
          this.collaborativeModel.userSimilarity.set(`${userId1}-${userId2}`, similarity);
        }
      });
    });

    // Calculate item similarities
    const products = Array.from(this.productData.keys());
    products.forEach(productId1 => {
      products.forEach(productId2 => {
        if (productId1 !== productId2) {
          const similarity = this.calculateItemSimilarity(productId1, productId2);
          this.collaborativeModel.itemSimilarity.set(`${productId1}-${productId2}`, similarity);
        }
      });
    });
  }

  calculateUserSimilarity(userId1, userId2) {
    // Get common products rated by both users
    const user1Ratings = new Map();
    const user2Ratings = new Map();

    this.interactionMatrix.forEach((interaction, key) => {
      if (interaction.userId === userId1) {
        user1Ratings.set(interaction.productId, interaction.rating);
      } else if (interaction.userId === userId2) {
        user2Ratings.set(interaction.productId, interaction.rating);
      }
    });

    const commonProducts = [];
    user1Ratings.forEach((rating1, productId) => {
      if (user2Ratings.has(productId)) {
        commonProducts.push({
          productId,
          rating1,
          rating2: user2Ratings.get(productId)
        });
      }
    });

    if (commonProducts.length === 0) return 0;

    // Calculate Pearson correlation coefficient
    const sum1 = commonProducts.reduce((sum, item) => sum + item.rating1, 0);
    const sum2 = commonProducts.reduce((sum, item) => sum + item.rating2, 0);
    const sum1Sq = commonProducts.reduce((sum, item) => sum + Math.pow(item.rating1, 2), 0);
    const sum2Sq = commonProducts.reduce((sum, item) => sum + Math.pow(item.rating2, 2), 0);
    const pSum = commonProducts.reduce((sum, item) => sum + item.rating1 * item.rating2, 0);

    const num = pSum - (sum1 * sum2 / commonProducts.length);
    const den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / commonProducts.length) * 
                         (sum2Sq - Math.pow(sum2, 2) / commonProducts.length));

    return den === 0 ? 0 : num / den;
  }

  calculateItemSimilarity(productId1, productId2) {
    // Calculate cosine similarity based on content features
    const features1 = this.contentFeatures.get(productId1);
    const features2 = this.contentFeatures.get(productId2);

    if (!features1 || !features2) return 0;

    const vector1 = this.flattenFeatures(features1);
    const vector2 = this.flattenFeatures(features2);

    return this.cosineSimilarity(vector1, vector2);
  }

  flattenFeatures(features) {
    return [
      ...features.categoryVector,
      ...features.ingredientVector,
      ...features.skinTypeVector,
      ...features.concernVector,
      features.priceNormalized,
      features.ratingNormalized,
      ...features.textureVector,
      features.spfNormalized
    ];
  }

  cosineSimilarity(vector1, vector2) {
    const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  trainContentBasedFiltering() {
    // Content-based model using feature weights
    this.contentModel = {
      featureWeights: {
        category: 0.25,
        ingredients: 0.3,
        skinType: 0.2,
        concerns: 0.15,
        price: 0.05,
        rating: 0.05
      }
    };
  }

  generateRecommendations(userId, numRecommendations = 5) {
    const collaborativeRecs = this.getCollaborativeRecommendations(userId, numRecommendations * 2);
    const contentRecs = this.getContentBasedRecommendations(userId, numRecommendations * 2);

    // Hybrid approach: combine and rank recommendations
    const hybridRecs = this.combineRecommendations(collaborativeRecs, contentRecs);

    // Remove products user has already interacted with
    const userInteractions = new Set();
    this.interactionMatrix.forEach((interaction, key) => {
      if (interaction.userId === userId) {
        userInteractions.add(interaction.productId);
      }
    });

    const filteredRecs = hybridRecs.filter(rec => !userInteractions.has(rec.productId));

    return filteredRecs.slice(0, numRecommendations).map(rec => ({
      ...rec,
      product: this.productData.get(rec.productId),
      reasoning: this.generateReasoning(userId, rec.productId)
    }));
  }

  getCollaborativeRecommendations(userId, numRecommendations) {
    const recommendations = [];
    const userProfile = this.userProfiles.get(userId);
    
    if (!userProfile) return recommendations;

    // Find similar users
    const similarUsers = [];
    this.collaborativeModel.userSimilarity.forEach((similarity, key) => {
      const [user1, user2] = key.split('-').map(Number);
      if (user1 === userId && similarity > 0.1) {
        similarUsers.push({ userId: user2, similarity });
      }
    });

    // Sort by similarity
    similarUsers.sort((a, b) => b.similarity - a.similarity);

    // Get recommendations from similar users
    const productScores = new Map();

    similarUsers.slice(0, 10).forEach(similarUser => {
      this.interactionMatrix.forEach((interaction, key) => {
        if (interaction.userId === similarUser.userId) {
          const currentScore = productScores.get(interaction.productId) || 0;
          const weightedScore = interaction.rating * similarUser.similarity;
          productScores.set(interaction.productId, currentScore + weightedScore);
        }
      });
    });

    // Convert to array and sort
    const sortedProducts = Array.from(productScores.entries())
      .map(([productId, score]) => ({ productId, score, type: 'collaborative' }))
      .sort((a, b) => b.score - a.score);

    return sortedProducts.slice(0, numRecommendations);
  }

  getContentBasedRecommendations(userId, numRecommendations) {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile || !userProfile.preferences) return [];

    const recommendations = [];
    const productScores = new Map();

    // Calculate scores for all products based on user preferences
    this.productData.forEach((product, productId) => {
      let score = 0;

      // Category preference
      const categoryScore = userProfile.preferences.categories.get(product.category) || 0;
      score += categoryScore * 0.3;

      // Ingredient preferences
      product.ingredients.forEach(ingredient => {
        const ingredientScore = userProfile.preferences.ingredients.get(ingredient) || 0;
        score += ingredientScore * 0.2;
      });

      // Skin type compatibility
      if (product.skinTypes.includes(userProfile.skinType) || product.skinTypes.includes('all')) {
        score += 2;
      }

      // Concern compatibility
      const concernMatch = userProfile.concerns.some(concern => product.concerns.includes(concern));
      if (concernMatch) {
        score += 1.5;
      }

      // Price compatibility
      const priceInRange = product.price >= userProfile.preferences.priceRange.min && 
                          product.price <= userProfile.preferences.priceRange.max * 1.2;
      if (priceInRange) {
        score += 1;
      }

      // Product rating
      score += product.rating * 0.5;

      productScores.set(productId, score);
    });

    // Convert to array and sort
    const sortedProducts = Array.from(productScores.entries())
      .map(([productId, score]) => ({ productId, score, type: 'content' }))
      .sort((a, b) => b.score - a.score);

    return sortedProducts.slice(0, numRecommendations);
  }

  combineRecommendations(collaborativeRecs, contentRecs) {
    const combinedScores = new Map();

    // Weight collaborative recommendations
    collaborativeRecs.forEach(rec => {
      const currentScore = combinedScores.get(rec.productId) || 0;
      combinedScores.set(rec.productId, currentScore + rec.score * this.hybridWeights.collaborative);
    });

    // Weight content-based recommendations
    contentRecs.forEach(rec => {
      const currentScore = combinedScores.get(rec.productId) || 0;
      combinedScores.set(rec.productId, currentScore + rec.score * this.hybridWeights.content);
    });

    // Convert to array and sort
    return Array.from(combinedScores.entries())
      .map(([productId, score]) => ({ productId, score, type: 'hybrid' }))
      .sort((a, b) => b.score - a.score);
  }

  generateReasoning(userId, productId) {
    const user = this.userProfiles.get(userId);
    const product = this.productData.get(productId);
    const reasons = [];

    if (!user || !product) return reasons;

    // Skin type match
    if (product.skinTypes.includes(user.skinType)) {
      reasons.push(`Perfect for ${user.skinType} skin`);
    }

    // Concern match
    const matchingConcerns = user.concerns.filter(concern => product.concerns.includes(concern));
    if (matchingConcerns.length > 0) {
      reasons.push(`Addresses your ${matchingConcerns.join(' and ')} concerns`);
    }

    // High rating
    if (product.rating >= 4.5) {
      reasons.push(`Highly rated (${product.rating}/5)`);
    }

    // Popular ingredients
    const popularIngredients = ['hyaluronic acid', 'vitamin c', 'niacinamide', 'retinol'];
    const hasPopularIngredient = product.ingredients.some(ing => 
      popularIngredients.some(pop => ing.includes(pop))
    );
    if (hasPopularIngredient) {
      const ingredient = product.ingredients.find(ing => 
        popularIngredients.some(pop => ing.includes(pop))
      );
      reasons.push(`Contains ${ingredient}`);
    }

    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  // Real-time recommendation updates
  updateUserInteraction(userId, productId, interactionType, rating = null) {
    const key = `${userId}-${productId}`;
    const existing = this.interactionMatrix.get(key);

    const interaction = {
      userId,
      productId,
      type: interactionType,
      rating: rating || (existing ? existing.rating : 3),
      timestamp: new Date(),
      timeSpent: existing ? existing.timeSpent + 30 : 30
    };

    this.interactionMatrix.set(key, interaction);
    this.saveInteractions();

    // Trigger real-time update
    this.updateUserProfile(userId);
  }

  updateUserProfile(userId) {
    // Rebuild user profile based on new interactions
    const user = this.userProfiles.get(userId);
    if (user) {
      user.preferences = {
        categories: new Map(),
        ingredients: new Map(),
        priceRange: { min: Infinity, max: 0 },
        averageRating: 0,
        totalInteractions: 0
      };

      // Recalculate preferences
      this.interactionMatrix.forEach((interaction, key) => {
        if (interaction.userId === userId) {
          const product = this.productData.get(interaction.productId);
          if (product) {
            // Update category preferences
            const currentCatScore = user.preferences.categories.get(product.category) || 0;
            user.preferences.categories.set(product.category, currentCatScore + interaction.rating);

            // Update ingredient preferences
            product.ingredients.forEach(ingredient => {
              const currentIngScore = user.preferences.ingredients.get(ingredient) || 0;
              user.preferences.ingredients.set(ingredient, currentIngScore + interaction.rating * 0.5);
            });

            // Update price range
            user.preferences.priceRange.min = Math.min(user.preferences.priceRange.min, product.price);
            user.preferences.priceRange.max = Math.max(user.preferences.priceRange.max, product.price);

            // Update average rating
            user.preferences.totalInteractions++;
            user.preferences.averageRating = 
              (user.preferences.averageRating * (user.preferences.totalInteractions - 1) + interaction.rating) / 
              user.preferences.totalInteractions;
          }
        }
      });
    }
  }

  saveInteractions() {
    const interactions = Array.from(this.interactionMatrix.values());
    localStorage.setItem('userInteractions', JSON.stringify(interactions));
  }

  createRecommendationInterface() {
    // Create a floating recommendation panel
    const panel = document.createElement('div');
    panel.id = 'mlRecommendationPanel';
    panel.className = 'ml-recommendation-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 320px;
      max-height: 500px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: none;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div class="rec-header" style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px;">🤖 AI Recommendations</h3>
        <button onclick="this.closest('.ml-recommendation-panel').style.display='none'" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
      </div>
      <div class="rec-controls" style="padding: 12px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
        <select id="recUserId" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 8px;">
          <option value="">Select User Profile</option>
        </select>
        <button onclick="window.mlEngine.showRecommendations()" style="width: 100%; background: #007bff; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">Get Recommendations</button>
      </div>
      <div id="recommendationList" style="max-height: 300px; overflow-y: auto; padding: 0;"></div>
      <div class="rec-footer" style="padding: 10px; background: #f8f9fa; border-top: 1px solid #dee2e6; font-size: 11px; color: #666; text-align: center;">
        Powered by ML Recommendation Engine
      </div>
    `;

    document.body.appendChild(panel);

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🤖';
    toggleButton.title = 'AI Recommendations';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 140px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,123,255,0.3);
      z-index: 10001;
      transition: transform 0.2s;
    `;
    
    toggleButton.onmouseover = () => toggleButton.style.transform = 'scale(1.1)';
    toggleButton.onmouseout = () => toggleButton.style.transform = 'scale(1)';
    toggleButton.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this.populateUserSelect();
      }
    };

    document.body.appendChild(toggleButton);
  }

  populateUserSelect() {
    const select = document.getElementById('recUserId');
    if (!select) return;

    select.innerHTML = '<option value="">Select User Profile</option>';
    
    // Add current user if logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      select.innerHTML += `<option value="${currentUser.id}">Current User (${currentUser.name})</option>`;
    }

    // Add sample users for demonstration
    this.userProfiles.forEach((profile, userId) => {
      const skinType = profile.skinType;
      const concerns = profile.concerns.slice(0, 2).join(', ');
      select.innerHTML += `<option value="${userId}">User ${userId} (${skinType}, ${concerns})</option>`;
    });
  }

  showRecommendations() {
    const userId = parseInt(document.getElementById('recUserId').value);
    if (!userId) {
      alert('Please select a user profile');
      return;
    }

    const recommendations = this.generateRecommendations(userId, 5);
    const listElement = document.getElementById('recommendationList');
    
    if (recommendations.length === 0) {
      listElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No recommendations available</div>';
      return;
    }

    listElement.innerHTML = recommendations.map((rec, index) => `
      <div class="rec-item" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.mlEngine.showProductDetails(${rec.product.id})">
        <div style="display: flex; justify-content: between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #333;">${rec.product.name}</h4>
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">$${rec.product.price} | ⭐ ${rec.product.rating}</div>
            <div style="font-size: 11px; color: #007bff; margin-bottom: 4px;">
              ${rec.reasoning.map(reason => `• ${reason}`).join('<br>')}
            </div>
          </div>
          <div style="background: #007bff; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">
            #${index + 1}
          </div>
        </div>
        <div style="margin-top: 6px;">
          <button onclick="event.stopPropagation(); window.mlEngine.simulateInteraction(${userId}, ${rec.product.id}, 'view')" style="background: #28a745; color: white; border: none; padding: 4px 8px; margin-right: 4px; border-radius: 3px; font-size: 10px; cursor: pointer;">View</button>
          <button onclick="event.stopPropagation(); window.mlEngine.simulateInteraction(${userId}, ${rec.product.id}, 'cart')" style="background: #ffc107; color: #333; border: none; padding: 4px 8px; margin-right: 4px; border-radius: 3px; font-size: 10px; cursor: pointer;">Cart</button>
          <button onclick="event.stopPropagation(); window.mlEngine.simulateInteraction(${userId}, ${rec.product.id}, 'purchase')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 10px; cursor: pointer;">Buy</button>
        </div>
      </div>
    `).join('');
  }

  simulateInteraction(userId, productId, type) {
    const rating = type === 'purchase' ? 5 : type === 'cart' ? 4 : 3;
    this.updateUserInteraction(userId, productId, type, rating);
    
    // Show feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 10002;
    `;
    feedback.textContent = `✅ Interaction recorded: ${type}`;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 2000);

    // Refresh recommendations
    setTimeout(() => this.showRecommendations(), 500);
  }

  showProductDetails(productId) {
    const product = this.productData.get(productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 10003;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #007bff;">${product.name}</h3>
          <button onclick="this.closest('div').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div style="font-size: 14px; line-height: 1.6;">
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Price:</strong> $${product.price}</p>
          <p><strong>Rating:</strong> ⭐ ${product.rating} (${product.reviews} reviews)</p>
          <p><strong>Skin Types:</strong> ${product.skinTypes.join(', ')}</p>
          <p><strong>Concerns:</strong> ${product.concerns.join(', ')}</p>
          <p><strong>Key Ingredients:</strong> ${product.ingredients.join(', ')}</p>
          <p><strong>Texture:</strong> ${product.texture}</p>
          ${product.spf > 0 ? `<p><strong>SPF:</strong> ${product.spf}</p>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  // Analytics and insights
  getRecommendationAnalytics() {
    const analytics = {
      totalUsers: this.userProfiles.size,
      totalProducts: this.productData.size,
      totalInteractions: this.interactionMatrix.size,
      averageInteractionsPerUser: this.interactionMatrix.size / this.userProfiles.size,
      topCategories: this.getTopCategories(),
      topIngredients: this.getTopIngredients(),
      modelPerformance: this.evaluateModelPerformance()
    };

    return analytics;
  }

  getTopCategories() {
    const categoryCounts = new Map();
    this.interactionMatrix.forEach(interaction => {
      const product = this.productData.get(interaction.productId);
      if (product) {
        categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
      }
    });

    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  getTopIngredients() {
    const ingredientCounts = new Map();
    this.interactionMatrix.forEach(interaction => {
      const product = this.productData.get(interaction.productId);
      if (product) {
        product.ingredients.forEach(ingredient => {
          ingredientCounts.set(ingredient, (ingredientCounts.get(ingredient) || 0) + 1);
        });
      }
    });

    return Array.from(ingredientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  evaluateModelPerformance() {
    // Simple evaluation metrics
    let totalPredictions = 0;
    let accuratePredictions = 0;

    // Sample some users and check if our recommendations match their preferences
    const sampleUsers = Array.from(this.userProfiles.keys()).slice(0, 20);
    
    sampleUsers.forEach(userId => {
      const recommendations = this.generateRecommendations(userId, 3);
      const userInteractions = Array.from(this.interactionMatrix.values())
        .filter(interaction => interaction.userId === userId && interaction.rating >= 4);

      recommendations.forEach(rec => {
        totalPredictions++;
        const hasHighRatedInteraction = userInteractions.some(interaction => 
          this.productData.get(interaction.productId).category === rec.product.category
        );
        if (hasHighRatedInteraction) {
          accuratePredictions++;
        }
      });
    });

    return {
      accuracy: totalPredictions > 0 ? (accuratePredictions / totalPredictions) : 0,
      totalPredictions,
      accuratePredictions
    };
  }
}

// Initialize ML Recommendation Engine
document.addEventListener('DOMContentLoaded', function() {
  window.mlEngine = new MLRecommendationEngine();
});
