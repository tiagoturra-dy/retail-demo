import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, User, MapPin, Award, Star, ShoppingBag, Search, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USERS } from '../../helpers/users.js';
import { profileService } from '../../services/profileService';
import styles from './AdminDashboardPage.module.css';

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [affinityInsights, setAffinityInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
    if (selectedUserId) {
      const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
          const data = await profileService.getAffinityData({cuid: selectedUserId});
          setAffinityInsights(data);
        } catch (error) {
          console.error('Error fetching profile insights:', error);
        } finally {
          setLoadingInsights(false);
        }
      };
      fetchInsights();
    } else {
      setAffinityInsights(null);
    }
  }, [selectedUserId]);

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const ecommUsers = USERS.ecomm;
  const filteredUsers = ecommUsers.filter(u => 
    u.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = ecommUsers.find(u => u.user_id === selectedUserId);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Manage and view e-commerce user profiles.</p>
      </div>

      <div className={styles.dashboardGrid}>
        {/* User List Sidebar */}
        <div className={styles.userListSidebar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.userList}>
            {filteredUsers.map((u) => (
              <button
                key={u.user_id}
                className={`${styles.userListItem} ${selectedUserId === u.user_id ? styles.active : ''}`}
                onClick={() => setSelectedUserId(u.user_id)}
              >
                <div className={styles.userAvatar}>
                  {u.Name.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.Name}</span>
                  <span className={styles.userEmail}>{u.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Detail View */}
        <div className={styles.userDetailView}>
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={selectedUser.user_id}
              className={styles.detailContent}
            >
              <div className={styles.detailHeader}>
                <div className={styles.largeAvatar}>
                  {selectedUser.Name.charAt(0)}
                </div>
                <div className={styles.detailTitleInfo}>
                  <h2 className={styles.detailName}>{selectedUser.Name}</h2>
                  <p className={styles.detailEmail}>{selectedUser.email}</p>
                  <div className={styles.membershipBadge}>
                    {selectedUser.MembershipNumber}
                  </div>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <Award className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Loyalty Level</span>
                    <span className={styles.statValue}>{selectedUser.LoyaltyLevel}</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Star className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Loyalty Points</span>
                    <span className={styles.statValue}>{selectedUser.LoyaltyPoints}</span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <MapPin className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Location</span>
                    <span className={styles.statValue}>{selectedUser.Location}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSections}>
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>Product Interests</h3>
                  <div className={styles.interestsTags}>
                    {selectedUser.ProductInterests.split(', ').map(interest => (
                      <span key={interest} className={styles.interestTag}>{interest}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>Recent Purchase</h3>
                  {selectedUser.RecentPurchaseName ? (
                    <div className={styles.purchaseCard}>
                      <ShoppingBag className={styles.purchaseIcon} />
                      <div className={styles.purchaseInfo}>
                        <span className={styles.purchaseName}>{selectedUser.RecentPurchaseName}</span>
                        <span className={styles.purchaseSku}>SKU: {selectedUser.RecentPurchaseSku || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noData}>No recent purchases found.</p>
                  )}
                </div>
              </div>

              {/* Affinity Insights Section */}
              <div className={styles.insightsSection}>
                <div className={styles.insightsHeader}>
                  <BarChart3 className={styles.insightsIcon} />
                  <h3 className={styles.insightsSectionTitle}>Affinity Insights</h3>
                </div>
                
                {loadingInsights ? (
                  <div className={styles.loadingInsights}>
                    <div className={styles.spinner}></div>
                    <span>Analyzing user behavior...</span>
                  </div>
                ) : affinityInsights ? (
                  <div className={styles.insightsGrid}>
                    {Object.entries(affinityInsights).map(([category, tags]) => (
                      <div key={category} className={styles.insightCategory}>
                        <h4 className={styles.categoryLabel}>{category}</h4>
                        <div className={styles.tagsCloud}>
                          {Object.entries(tags).map(([tag, count]) => (
                            <div key={tag} className={styles.insightTag}>
                              <span className={styles.tagName}>{tag}</span>
                              <span className={styles.tagCount}>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No insights available for this user.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className={styles.emptyDetailState}>
              <Users className={styles.emptyIcon} />
              <h3>Select a user to view details</h3>
              <p>Choose a user from the list on the left to see their full profile and activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
