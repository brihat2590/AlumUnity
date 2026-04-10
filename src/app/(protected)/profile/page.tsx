'use client'
import React, { useState, useEffect } from 'react';
import { updateUserInfo, getUserInfo } from '@/firebase/user.controller';
import { toast } from 'sonner';
import { useFirebase } from '@/firebase/firebase.config';

const Profile = () => {
  // const userId = "imgInmRjc0noGAw5CFBa"; // TODO: Replace with actual user ID once auth is implemented
  const {loggedInUser} = useFirebase();
  const userId = loggedInUser?.uid || '';

  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    Role: '',
    profilePic: '',
    Education: '',
    Bio: '',
    linkedIn: '',
    github: '',
    twitter: '',
    portfolio: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;

      const response = await getUserInfo(userId);
      if (response.success && response.data) {
        const userData = response.data;
        setFormData({
          name: userData.name || '',
          batch: userData.batch || '',
          Role: userData.Role || '',
          profilePic: userData.profilePic || '',
          Education: userData.Education || '',
          Bio: userData.Bio || '',
          linkedIn: userData.linkedIn || '',
          github: userData.github || '',
          twitter: userData.twitter || '',
          portfolio: userData.portfolio || '',
        });
        setSkills(userData.skills || []);
        setInterests(userData.interests || []);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('User is not authenticated yet. Please try again.');
      return;
    }

    const userInfo = {
      ...formData,
      skills,
      interests,
    };

    const response = await updateUserInfo(userId, userInfo);
    if (response.success) {
      toast.success('User information updated successfully!');
    } else {
      toast.error(`Failed to update user information: ${response.message}`);
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Profile</h1>
      <form style={{ background: '#f9f9f9', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Batch:</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Role:</label>
            <select
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', background: 'white' }}
            >
              <option value="">Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Profile Picture URL:</label>
            <input
              type="text"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
        </div>
  
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Education:</label>
          <input
            type="text"
            name="Education"
            value={formData.Education}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
          />
        </div>
  
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Bio:</label>
          <textarea
            name="Bio"
            value={formData.Bio}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', minHeight: '100px' }}
          ></textarea>
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>LinkedIn:</label>
            <input
              type="text"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>GitHub:</label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Twitter:</label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Portfolio:</label>
            <input
              type="text"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
        </div>
  
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Skills:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Enter a skill"
              style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
            <button 
              type="button" 
              onClick={handleAddSkill}
              style={{ padding: '10px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {skills.map((skill, index) => (
              <span 
                key={index} 
                style={{ 
                  padding: '5px 10px', 
                  background: '#e0f7fa', 
                  borderRadius: '15px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '14px'
                }}
              >
                {skill} 
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#e74c3c', 
                    cursor: 'pointer', 
                    fontSize: '12px',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
  
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e' }}>Interests:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Enter an interest"
              style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
            <button 
              type="button" 
              onClick={handleAddInterest}
              style={{ padding: '10px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {interests.map((interest, index) => (
              <span 
                key={index} 
                style={{ 
                  padding: '5px 10px', 
                  background: '#e8f8f5', 
                  borderRadius: '15px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '14px'
                }}
              >
                {interest} 
                <button 
                  type="button" 
                  onClick={() => handleRemoveInterest(interest)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#e74c3c', 
                    cursor: 'pointer', 
                    fontSize: '12px',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
  
        <button 
          type="button" 
          onClick={handleSave}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#2ecc71', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '16px', 
            fontWeight: '600', 
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#27ae60'}
          onMouseOut={(e) => e.target.style.background = '#2ecc71'}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;