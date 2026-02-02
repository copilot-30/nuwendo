import pool from './src/config/database.js';

async function testDashboardQueries() {
  try {
    console.log('Testing dashboard queries...\n');

    // Test pending payments query
    console.log('1. Testing pending payments query...');
    const pendingPaymentsResult = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.amount_paid, b.payment_status, b.phone_number,
              u.first_name, u.last_name, u.email,
              s.name as service_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.payment_status = 'pending' AND b.status != 'cancelled'
       ORDER BY b.booking_date ASC, b.booking_time ASC
       LIMIT 10`
    );
    console.log(`✓ Pending payments query successful: ${pendingPaymentsResult.rows.length} rows`);

    // Test pending amount query
    console.log('\n2. Testing pending amount query...');
    const pendingAmountResult = await pool.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total FROM bookings 
       WHERE payment_status = 'pending' AND status != 'cancelled'`
    );
    console.log(`✓ Pending amount query successful: $${pendingAmountResult.rows[0].total}`);

    // Test recent bookings query
    console.log('\n3. Testing recent bookings query...');
    const recentBookingsResult = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.amount_paid, b.payment_status,
              u.first_name, u.last_name, u.email,
              s.name as service_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );
    console.log(`✓ Recent bookings query successful: ${recentBookingsResult.rows.length} rows`);

    console.log('\n✅ All queries executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDashboardQueries();
