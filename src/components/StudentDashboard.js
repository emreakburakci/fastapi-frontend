import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Row, Col, Form, Table, Alert, Card } from 'react-bootstrap';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [concordanceWord, setConcordanceWord] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://13.60.234.251:8000/get_courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const username = localStorage.getItem('username');
      console.log("USERNAME: ", username);
      const response = await axios.post('http://13.60.234.251:8000/student/courses', username, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setEnrolledCourses(response.data);
    } catch (err) {
      setError('Failed to fetch enrolled courses');
    }
  };

  const handleEnrollCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://13.60.234.251:8000/enroll_course', {
        course_id: selectedCourse,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess('Enrolled in course successfully');
      fetchEnrolledCourses(); // Refresh the enrolled courses list
    } catch (err) {
      setError('Failed to enroll in course');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      const response = await axios.post('http://13.60.234.251:8000/analyze_file', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(response.data);
      setSuccess('File analyzed successfully');
    } catch (err) {
      setError('Failed to analyze file');
    }
  };

  const handleNLPFunction = async (endpoint, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    try {
      const response = await axios.post(`http://13.60.234.251:8000/${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(response.data);
      setSuccess(`${endpoint.replace('_', ' ')} executed successfully`);
    } catch (err) {
      setError(`Failed to execute ${endpoint.replace('_', ' ')}`);
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    if (Array.isArray(analysisResult)) {
      return (
        <Table striped bordered hover>
          <thead>
            <tr>
              {Object.keys(analysisResult[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analysisResult.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    if (typeof analysisResult === 'object') {
      return (
        <Card>
          <Card.Body>
            {Object.entries(analysisResult).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
              </div>
            ))}
          </Card.Body>
        </Card>
      );
    }

    return <pre>{JSON.stringify(analysisResult, null, 2)}</pre>;
  };

  return (
    <Container>
      <h1 className="text-center my-4">Student Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Row className="mb-4">
        <Col>
          <h2>Enroll in Course</h2>
          <Form onSubmit={handleEnrollCourse}>
            <Form.Group controlId="formCourseSelect" className="mb-3">
              <Form.Label>Select Course</Form.Label>
              <Form.Control as="select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Enroll
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>Enrolled Courses</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course Name</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>Upload File for Analysis</h2>
          <Form onSubmit={handleFileUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
            </Form.Group>
            <Form.Group controlId="formFileType" className="mb-3">
              <Form.Label>File Type</Form.Label>
              <Form.Control as="select" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                <option value="">Select file type</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Upload
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h2>NLP Functions</h2>
          <Form.Group controlId="formConcordanceWord" className="mb-3">
            <Form.Label>Concordance Word</Form.Label>
            <Form.Control
              type="text"
              value={concordanceWord}
              onChange={(e) => setConcordanceWord(e.target.value)}
              placeholder="Enter word for concordance"
            />
          </Form.Group>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('word_frequency')}>
            Word Frequency
          </Button>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('pos_tags')}>
            POS Tags
          </Button>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('named_entities')}>
            Named Entities
          </Button>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('sentiment_analysis')}>
            Sentiment Analysis
          </Button>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('ngrams')}>
            N-Grams
          </Button>
          <Button variant="secondary" className="me-2" onClick={() => handleNLPFunction('concordance', { word: concordanceWord })}>
            Concordance
          </Button>
        </Col>
      </Row>
      {analysisResult && (
        <Row className="mb-4">
          <Col>
            <h2>Analysis Result</h2>
            {renderAnalysisResult()}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default StudentDashboard;