
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { getStudentMarks, StudentMarkData } from '@/utils/api';
import { normalizeUSN } from '@/utils/studentIdentification';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AcademicPerformance = () => {
  const [marksData, setMarksData] = useState<StudentMarkData[]>([]);
  const [semesterPerformance, setSemesterPerformance] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  
  useEffect(() => {
    const loadMarksData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Use USN preferentially, fall back to ID
        const identifier = user.usn ? normalizeUSN(user.usn) : user.id;
        const marks = await getStudentMarks(identifier);
        
        // Transform marks for component use
        setMarksData(marks);
        
        // Extract unique semesters from marks data
        const semesters = Array.from(new Set(marks
          .map(mark => mark.semester_name)
          .filter(semester => semester !== undefined))) as string[];
        
        setAvailableSemesters(semesters);
        
        // Set default selected semester to the most recent one
        if (semesters.length > 0) {
          // Sort semesters numerically and take the highest one
          const sortedSemesters = [...semesters].sort((a, b) => {
            const numA = parseInt(a || '0');
            const numB = parseInt(b || '0');
            return numB - numA; // Descending order
          });
          
          setSelectedSemester(sortedSemesters[0]);
        }
        
        // Initially show all marks (limit to 5 for readability)
        updateSemesterPerformance(marks);
      } catch (error) {
        console.error('Error loading student marks:', error);
      }
    };
    
    loadMarksData();
  }, []);
  
  // Update performance data when selected semester changes
  useEffect(() => {
    if (!selectedSemester) {
      updateSemesterPerformance(marksData);
      return;
    }
    
    const filteredMarks = selectedSemester === 'all' 
      ? marksData 
      : marksData.filter(mark => mark.semester_name === selectedSemester);
    
    updateSemesterPerformance(filteredMarks);
  }, [selectedSemester, marksData]);
  
  const updateSemesterPerformance = (marks: StudentMarkData[]) => {
    // Create semester performance data - filter to max 5 subjects for chart readability
    const semPerformance = marks.slice(0, 5).map(mark => ({
      name: mark.courseName,
      IA1: mark.IA1,
      IA2: mark.IA2,
      Semester: mark.semester,
      Total: mark.totalMarks,
      subject: mark.courseName
    }));
    
    setSemesterPerformance(semPerformance);
  };
  
  // Create grade distribution data for the selected semester
  const getGradeDistribution = () => {
    const marksToUse = selectedSemester === 'all' || !selectedSemester
      ? marksData
      : marksData.filter(mark => mark.semester_name === selectedSemester);
    
    const gradeCount: Record<string, number> = {};
    
    marksToUse.forEach(mark => {
      if (gradeCount[mark.grade]) {
        gradeCount[mark.grade]++;
      } else {
        gradeCount[mark.grade] = 1;
      }
    });
    
    return Object.keys(gradeCount).map(grade => ({
      grade,
      count: gradeCount[grade]
    }));
  };
  
  // Calculate average marks for each assessment type
  const getAverageMarks = () => {
    const marksToUse = selectedSemester === 'all' || !selectedSemester
      ? marksData
      : marksData.filter(mark => mark.semester_name === selectedSemester);
    
    if (marksToUse.length === 0) return [];
    
    let totalIA1 = 0;
    let totalIA2 = 0;
    let totalSemester = 0;
    let totalAssignments = 0;
    
    marksToUse.forEach(mark => {
      totalIA1 += mark.IA1 || 0;
      totalIA2 += mark.IA2 || 0;
      totalSemester += mark.semester || 0;
      totalAssignments += mark.assignments || 0;
    });
    
    return [
      { name: 'IA1', average: (totalIA1 / marksToUse.length).toFixed(2) },
      { name: 'IA2', average: (totalIA2 / marksToUse.length).toFixed(2) },
      { name: 'Assignments', average: (totalAssignments / marksToUse.length).toFixed(2) },
      { name: 'Semester', average: (totalSemester / marksToUse.length).toFixed(2) }
    ];
  };
  
  return (
    <div className="space-y-6">
      {availableSemesters.length > 0 && (
        <div className="flex justify-end">
          <div className="w-48">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {availableSemesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {`Semester ${sem}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            Subject Performance
            {selectedSemester && selectedSemester !== 'all' && ` - Semester ${selectedSemester}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {semesterPerformance.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={semesterPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="IA1" fill="#8884d8" name="Internal Assessment 1" />
                  <Bar dataKey="IA2" fill="#82ca9d" name="Internal Assessment 2" />
                  <Bar dataKey="Semester" fill="#ffc658" name="Semester Exam" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data available for the selected semester
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Grade Distribution
              {selectedSemester && selectedSemester !== 'all' && ` - Semester ${selectedSemester}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getGradeDistribution().length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getGradeDistribution()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Subjects" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No grade data available for the selected semester
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              Average Performance
              {selectedSemester && selectedSemester !== 'all' && ` - Semester ${selectedSemester}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAverageMarks().length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getAverageMarks()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#82ca9d" name="Average Marks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No average performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicPerformance;
