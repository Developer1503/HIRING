import { CandidateResult } from '../services/candidateResultsApi';
import { ResumeAnalysis } from '../types';

export const generateLiveTestResult = (): CandidateResult => {
  const testResumeAnalysis: ResumeAnalysis = {
    id: 'test-resume-analysis-1',
    fileName: 'john_doe_resume.pdf',
    analysis: {
      overallScore: 78,
      sections: {
        contact: { 
          score: 85, 
          feedback: 'Professional email address present; Phone number included; LinkedIn profile linked; Consider adding GitHub profile' 
        },
        summary: { 
          score: 72, 
          feedback: 'Summary is 95 words (recommended: 30-80 words); Mentions years of experience; Could use more power words like "experienced", "skilled"' 
        },
        experience: { 
          score: 80, 
          feedback: 'Strong use of action verbs (developed, implemented, led); Quantified achievements (10,000+ users, 40% reduction); Good bullet point structure; Could add more specific metrics' 
        },
        education: { 
          score: 90, 
          feedback: 'Clear degree information; GPA included (3.8/4.0); Graduation year present; Relevant coursework mentioned' 
        },
        skills: { 
          score: 75, 
          feedback: 'Good variety of technical skills (8 found); Includes modern frameworks (React, Node.js); Missing trending skills (Docker, Kubernetes, AWS); Limited soft skills mentioned' 
        },
        projects: { 
          score: 68, 
          feedback: '2 relevant projects included; Technology stack mentioned; Missing GitHub links; No live demo URLs provided' 
        }
      },
      strengths: [
        'Strong technical background - Solid foundation in web technologies',
        'Quantified achievements - Good use of metrics in experience section',
        'Clear educational qualifications - Well-presented academic background',
        'Professional contact information - Complete and accessible'
      ],
      weaknesses: [
        'Summary section - Too lengthy and lacks impact',
        'Missing trending skills - No mention of cloud/containerization technologies',
        'Project documentation - Lacks links to code repositories',
        'Limited soft skills - Only 2 soft skills mentioned'
      ],
      recommendations: [
        'Rewrite summary to 30-50 words with power words like "experienced", "skilled", "proficient"',
        'Add trending skills: Docker basics, AWS services, TypeScript for type safety',
        'Enhance project section with GitHub repository links and live demo URLs',
        'Add more soft skills like leadership, communication, and time management',
        'Include deployment platforms and CI/CD pipeline experience'
      ],
      keywords: {
        technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Express', 'MongoDB'],
        soft: ['Problem-solving', 'Teamwork'],
        missing: ['Docker', 'AWS', 'Kubernetes', 'TypeScript', 'GraphQL']
      },
      atsScore: 82,
      readabilityScore: 76
    },
    createdAt: new Date().toISOString()
  };

  return {
    id: `test-result-${Date.now()}`,
    candidateId: 'test-user-123',
    candidateName: 'John Doe',
    email: 'john.doe@email.com',
    testDate: new Date().toISOString(),
    assessmentResults: {
      overallScore: 78,
      percentile: 73,
      grade: 'B+',
      dsaScore: 70,
      aptitudeScore: 76,
      interviewScore: 88,
      timeSpent: 45,
      strengths: [
        'Strong Communication Skills - Excellent interview performance (88%)',
        'Logical Reasoning - High aptitude in logical section (87.5%)',
        'Problem-Solving Approach - Good DSA fundamentals',
        'Time Management - Completed all sections within time limits'
      ],
      weaknesses: [
        'Dynamic Programming - Struggled with DP problems (3/5 incorrect)',
        'Verbal Reasoning - Below average performance (66.7%)',
        'System Design Knowledge - Limited understanding of scalability concepts'
      ]
    },
    resumeAnalysis: testResumeAnalysis,
    recommendations: [
      'Focus on dynamic programming patterns - Practice 5 DP problems daily',
      'Improve verbal reasoning through daily reading and comprehension exercises',
      'Study system design fundamentals - Learn microservices and scaling concepts',
      'Pursue AWS Cloud Practitioner certification for cloud skills',
      'Practice coding interviews with emphasis on optimization techniques'
    ],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const saveTestResultToLocalStorage = () => {
  const testResult = generateLiveTestResult();
  const existingResults = JSON.parse(localStorage.getItem('candidateResults') || '[]');
  
  // Add test result if not already present
  const hasTestResult = existingResults.some((r: CandidateResult) => r.candidateName === 'John Doe');
  if (!hasTestResult) {
    existingResults.unshift(testResult);
    localStorage.setItem('candidateResults', JSON.stringify(existingResults));
  }
  
  return testResult;
};