import { Badge, Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Space, Spin, Statistic, Table, Tag, Typography, message } from 'antd';
import { CalendarOutlined, DollarOutlined, HistoryOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

const SalaryManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(moment());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalPaid: 0,
        totalAmount: 0
    });

    const currencySymbol = 'LKR';
    const currencyFormat = (value) => `${currencySymbol}${Number(value || 0).toFixed(2)}`;

    const fetchEmployees = async (month, year) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:4000/api/salaries/employees', {
                month: month + 1, year
            });
            setEmployees(response.data);
            
            // Count paid employees for the selected month/year
            const paidEmployees = response.data.filter(emp => 
                hasSalaryForMonth(emp.employee_id)
            ).length;
            
            // Calculate total amount paid for the selected month/year
            const relevantSalaries = salaries.filter(
                sal => sal.month === month + 1 && sal.year === year
            );
            const totalAmount = relevantSalaries.reduce((sum, salary) => sum + Number(salary.total_salary || 0), 0);
            
            setStats({
                totalEmployees: response.data.length,
                totalPaid: paidEmployees,
                totalAmount: totalAmount
            });
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            message.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/salaries/admin');
            setSalaries(response.data);
        } catch (error) {
            console.error('Failed to fetch salaries:', error);
            message.error('Failed to fetch salaries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
        // Initialize with current month's data
        fetchEmployees(selectedMonth.month(), selectedMonth.year());
    }, []);

    const handleMonthChange = (date) => {
        setSelectedMonth(date);
        if (date) {
            fetchEmployees(date.month(), date.year());
        }
    };

    const hasSalaryForMonth = (employeeId) => {
        if (!selectedMonth) return false;
        
        return salaries.some(salary => 
            salary.employee_id === employeeId && 
            salary.month === selectedMonth.month() + 1 && 
            salary.year === selectedMonth.year()
        );
    };

    const handleCreateSalary = (employee) => {
        if (hasSalaryForMonth(employee.employee_id)) {
            message.warning('Salary already created for this employee in the selected month');
            return;
        }
        
        setSelectedEmployee(employee);
        form.setFieldsValue({
            month: selectedMonth,
            year: selectedMonth.year(),
            bonus: 0
        });
        setIsModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await axios.post('http://localhost:4000/api/salaries', {
                employee_id: selectedEmployee.employee_id,
                month: values.month.month() + 1,
                year: values.month.year(),
                bonus: values.bonus
            });
            message.success('Salary created successfully');
            setIsModalVisible(false);
            fetchSalaries();
            fetchEmployees(selectedMonth.month(), selectedMonth.year());
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to create salary';
            message.error(errorMessage);
        }
    };

    const calculateTotal = () => {
        const bonus = parseFloat(form.getFieldValue('bonus') || 0);
        const base = parseFloat(selectedEmployee?.base_salary || 0);
        return (base + bonus).toFixed(2);
    };

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (name) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{name}</Text>
                </Space>
            )
        },
        {
            title: 'Base Salary',
            dataIndex: 'base_salary',
            key: 'base_salary',
            render: (value) => (
                <Text type="secondary">
                    {currencyFormat(value)}
                </Text>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                hasSalaryForMonth(record.employee_id) ? 
                <Tag color="success">Paid</Tag> : 
                <Tag color="warning">Pending</Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type={hasSalaryForMonth(record.employee_id) ? "default" : "primary"}
                    icon={<DollarOutlined />}
                    onClick={() => handleCreateSalary(record)}
                    disabled={hasSalaryForMonth(record.employee_id)}
                >
                    {hasSalaryForMonth(record.employee_id) ? 'Paid' : 'Process Payment'}
                </Button>
            ),
        },
    ];

    const salaryColumns = [
        {
            title: 'Employee',
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (name) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{name}</Text>
                </Space>
            )
        },
        {
            title: 'Period',
            key: 'period',
            render: (record) => {
                if (!record.year || !record.month) {
                    return <Text type="danger">Invalid date</Text>;
                }

                const date = moment(`${record.year}-${record.month}-01`, 'YYYY-M-D');
                return (
                    <Space>
                        <CalendarOutlined />
                        <Text>{date.isValid() ? date.format('MMMM YYYY') : 'Invalid date'}</Text>
                    </Space>
                );
            },
        },
        {
            title: 'Base Salary',
            dataIndex: 'base_salary',
            key: 'base_salary',
            render: (value) => currencyFormat(value)
        },
        {
            title: 'Bonus',
            dataIndex: 'bonus',
            key: 'bonus',
            render: (value) => (
                <Text type={Number(value) > 0 ? "success" : "secondary"}>
                    {currencyFormat(value)}
                </Text>
            )
        },
        {
            title: 'Total',
            dataIndex: 'total_salary',
            key: 'total_salary',
            render: (value) => (
                <Text strong>
                    {currencyFormat(value)}
                </Text>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (
                <Space>
                    <HistoryOutlined />
                    {moment(date).format('MMM DD, YYYY')}
                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    onClick={() => window.location.href = `/salary-details/${record.salary_id}`}
                >
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Card bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={2}>
                            <DollarOutlined /> Salary Management
                        </Title>
                        <DatePicker 
                            picker="month"
                            value={selectedMonth} 
                            onChange={handleMonthChange} 
                            format="MMMM YYYY"
                            style={{ width: 180 }}
                            placeholder="Select month"
                        />
                    </div>

                    <Divider />
                    
                    {/* Stats Cards */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card>
                                <Statistic 
                                    title="Total Employees" 
                                    value={stats.totalEmployees} 
                                    prefix={<UserOutlined />} 
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic 
                                    title="Payments Processed" 
                                    value={stats.totalEmployees}   
                                    suffix={`/ ${stats.totalPaid}`}
                                    valueStyle={{ color: stats.totalPaid !== stats.totalEmployees ? '#3f8600' : '#cf1322' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic 
                                    title="Total Amount" 
                                    value={stats.totalAmount} 
                                    prefix={currencySymbol} 
                                    precision={2}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card 
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Employees for {selectedMonth.format('MMMM YYYY')}</span>
                            </Space>
                        }
                        extra={
                            <Badge 
                                count={stats.totalPaid === stats.totalEmployees ? 0 : stats.totalEmployees - stats.totalPaid} 
                                style={{ 
                                    backgroundColor: stats.totalPaid !== stats.totalEmployees ? '#52c41a' : '#f5222d',
                                    display: stats.totalPaid === stats.totalEmployees ? 'none' : 'inline-block'
                                }}
                                showZero={false}
                                overflowCount={999}
                            >
                                <Text>{stats.totalPaid === stats.totalEmployees ? 'Pending Payments' : 'All Paid'  }</Text>
                            </Badge>
                        }
                        bordered={false}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={employees} 
                            rowKey="employee_id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            locale={{ emptyText: selectedMonth ? 'No employees found for selected month' : 'Please select a month' }}
                        />
                    </Card>
                    
                    <Card 
                        title={
                            <Space>
                                <HistoryOutlined />
                                <span>Salary History</span>
                            </Space>
                        }
                        bordered={false}
                    >
                        <Table 
                            columns={salaryColumns} 
                            dataSource={salaries} 
                            rowKey="salary_id" 
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Space>
            </Card>

            <Modal
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Process Payment for {selectedEmployee?.employee_name}</span>
                    </Space>
                }
                visible={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText="Process Payment"
                cancelText="Cancel"
                width={500}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="month" label="Pay Period" rules={[{ required: true }]}>
                        <DatePicker picker="month" disabled style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Base Salary">
                                <Input 
                                    value={currencyFormat(selectedEmployee?.base_salary)} 
                                    disabled 
                                    prefix={<span>{currencySymbol}</span>} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="bonus" 
                                label="Bonus Amount" 
                                rules={[{ required: true, message: 'Please input bonus amount' }]}
                            >
                                <Input 
                                    type="number" 
                                    prefix={<span>{currencySymbol}</span>} 
                                    onChange={() => form.setFieldsValue({ total: calculateTotal() })}
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Divider />
                    
                    <Form.Item label="Total Payment">
                        <Input 
                            value={currencyFormat(calculateTotal())}
                            disabled 
                            prefix={<span>{currencySymbol}</span>}
                            style={{ fontWeight: 'bold', fontSize: '16px' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalaryManagement;