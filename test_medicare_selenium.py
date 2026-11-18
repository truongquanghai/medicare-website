
"""
BỘ KIỂM THỬ SELENIUM TỰ ĐỘNG CHO WEBSITE MEDICARE

Yêu cầu:
    - Frontend: http://localhost:5173
    - Backend: http://localhost:4000
    - MySQL đang hoạt động.

Cài đặt:
    pip install selenium

Chạy toàn bộ:
    python -m unittest -v test_medicare_selenium.py

Cấu hình tùy chọn:
    MEDICARE_URL
    MEDICARE_PATIENT_EMAIL
    MEDICARE_DOCTOR_EMAIL
    MEDICARE_ADMIN_EMAIL
    MEDICARE_PASSWORD
"""

import os
import time
import unittest

from datetime import date, timedelta

from selenium import webdriver
from selenium.common.exceptions import (
    TimeoutException,
    WebDriverException,
    ElementClickInterceptedException,
    StaleElementReferenceException
)

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# =========================================================
# 1. CẤU HÌNH
# =========================================================

BASE_URL = os.getenv(
    "MEDICARE_URL",
    "http://localhost:5173"
)

PATIENT_EMAIL = os.getenv(
    "MEDICARE_PATIENT_EMAIL",
    "patient@medicare.vn"
)

DOCTOR_EMAIL = os.getenv(
    "MEDICARE_DOCTOR_EMAIL",
    "doctor@medicare.vn"
)

ADMIN_EMAIL = os.getenv(
    "MEDICARE_ADMIN_EMAIL",
    "admin@medicare.vn"
)

PASSWORD = os.getenv(
    "MEDICARE_PASSWORD",
    "123456"
)

WAIT_SECONDS = 12


# =========================================================
# 2. LỚP KIỂM THỬ MEDICARE
# =========================================================

class MedicareSeleniumTests(unittest.TestCase):

    """
    Mỗi test case sử dụng một phiên Chrome độc lập.
    """

    @classmethod
    def setUpClass(cls):

        options = webdriver.ChromeOptions()

        options.add_argument("--start-maximized")
        options.add_argument("--disable-notifications")

        # Bỏ comment nếu muốn chạy không hiển thị Chrome.
        # options.add_argument("--headless=new")

        cls.options = options

    # -----------------------------------------------------
    # Khởi tạo trình duyệt trước mỗi test case
    # -----------------------------------------------------

    def setUp(self):

        try:

            self.driver = webdriver.Chrome(
                options=self.options
            )

            self.driver.maximize_window()

            self.wait = WebDriverWait(
                self.driver,
                WAIT_SECONDS
            )

            self.driver.get(BASE_URL)

        except WebDriverException as exc:

            self.fail(
                "Không thể khởi tạo Chrome WebDriver. "
                "Hãy kiểm tra Chrome và Selenium. "
                + str(exc)
            )

    # -----------------------------------------------------
    # Đóng trình duyệt sau mỗi test case
    # -----------------------------------------------------

    def tearDown(self):

        if getattr(self, "driver", None):

            self.driver.quit()

    # -----------------------------------------------------
    # Hàm tìm văn bản hiển thị trên trang
    # -----------------------------------------------------

    def wait_text(self, text):

        xpath = (
            "//*[contains(normalize-space(), "
            + self._xpath_literal(text)
            + ")]"
        )

        return self.wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, xpath)
            )
        )

    # -----------------------------------------------------
    # Hỗ trợ tạo biểu thức XPath
    # -----------------------------------------------------

    @staticmethod
    def _xpath_literal(value):

        if "'" not in value:

            return f"'{value}'"

        if '"' not in value:

            return f'"{value}"'

        parts = value.split("'")

        return (
            "concat("
            + ', "\'", '.join(
                f"'{part}'" for part in parts
            )
            + ")"
        )

    # -----------------------------------------------------
    # Hàm click phần tử an toàn
    # -----------------------------------------------------

    def click_element(self, element):

        """
        Cuộn phần tử vào giữa màn hình,
        chờ phần tử có thể thao tác rồi click.

        Nếu bị che khuất, thử lại bằng ActionChains.
        Không dùng JavaScript click để tránh bỏ qua
        các vấn đề giao diện thực tế.
        """

        for lan_thu in range(3):

            try:

                self.driver.execute_script(
                    """
                    arguments[0].scrollIntoView({
                        behavior: 'instant',
                        block: 'center',
                        inline: 'center'
                    });
                    """,
                    element
                )

                self.wait.until(
                    lambda driver:
                    element.is_displayed()
                    and element.is_enabled()
                )

                time.sleep(0.3)

                element.click()

                return

            except ElementClickInterceptedException:

                if lan_thu == 2:

                    raise

                # Thử di chuyển chuột đến phần tử
                ActionChains(
                    self.driver
                ).move_to_element(
                    element
                ).pause(0.3).click().perform()

                return

            except StaleElementReferenceException:

                if lan_thu == 2:

                    raise

                time.sleep(0.5)

    # -----------------------------------------------------
    # Đăng nhập tài khoản
    # -----------------------------------------------------

    def login(self, email, password=PASSWORD):

        self.driver.get(
            BASE_URL + "/dang-nhap"
        )

        email_input = self.wait.until(
            EC.visibility_of_element_located(
                (By.NAME, "email")
            )
        )

        email_input.clear()
        email_input.send_keys(email)

        password_input = self.driver.find_element(
            By.NAME,
            "password"
        )

        password_input.clear()
        password_input.send_keys(password)

        button = self.driver.find_element(
            By.CSS_SELECTOR,
            "form button[type='submit']"
        )

        self.click_element(button)

    # =====================================================
    # TEST CASE 01: KIỂM TRA TRANG CHỦ
    # =====================================================

    def test_01_trang_chu_hien_thi(self):

        self.driver.get(BASE_URL)

        self.wait_text("Medi")

        self.assertIn(
            BASE_URL,
            self.driver.current_url
        )

    # =====================================================
    # TEST CASE 02: ĐĂNG NHẬP BỆNH NHÂN THÀNH CÔNG
    # =====================================================

    def test_02_dang_nhap_benh_nhan_thanh_cong(self):

        self.login(PATIENT_EMAIL)

        self.wait.until(
            EC.url_contains("/tai-khoan")
        )

        self.wait_text("Lịch khám của bạn")

        self.assertIn(
            "/tai-khoan",
            self.driver.current_url
        )

    # =====================================================
    # TEST CASE 03: ĐĂNG NHẬP SAI MẬT KHẨU
    # =====================================================

    def test_03_dang_nhap_sai_mat_khau(self):

        self.driver.get(
            BASE_URL + "/dang-nhap"
        )

        self.driver.find_element(
            By.NAME,
            "email"
        ).send_keys(PATIENT_EMAIL)

        self.driver.find_element(
            By.NAME,
            "password"
        ).send_keys("sai_mat_khau")

        button = self.driver.find_element(
            By.CSS_SELECTOR,
            "form button[type='submit']"
        )

        self.click_element(button)

        error = self.wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, "[role='alert']")
            )
        )

        self.assertTrue(
            error.text.strip()
        )

    # =====================================================
    # TEST CASE 04: ĐĂNG KÝ TÀI KHOẢN MỚI
    # =====================================================

    def test_04_dang_ky_tai_khoan_moi(self):

        self.driver.get(
            BASE_URL + "/dang-ky"
        )

        stamp = str(
            int(time.time() * 1000)
        )

        self.driver.find_element(
            By.NAME,
            "full_name"
        ).send_keys("Selenium Test")

        self.driver.find_element(
            By.NAME,
            "email"
        ).send_keys(
            f"selenium_{stamp}@example.com"
        )

        self.driver.find_element(
            By.NAME,
            "phone"
        ).send_keys("0912345678")

        self.driver.find_element(
            By.NAME,
            "password"
        ).send_keys("123456")

        button = self.driver.find_element(
            By.CSS_SELECTOR,
            "form button[type='submit']"
        )

        self.click_element(button)

        self.wait.until(
            EC.url_contains("/tai-khoan")
        )

        self.wait_text("Selenium Test")

    # =====================================================
    # TEST CASE 05: DANH SÁCH BÁC SĨ HIỂN THỊ
    # =====================================================

    def test_05_danh_sach_bac_si_hien_thi(self):

        self.driver.get(
            BASE_URL + "/bac-si"
        )

        self.wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".doctor-card")
            )
        )

        doctors = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".doctor-card"
        )

        self.assertGreater(
            len(doctors),
            0
        )

    # =====================================================
    # TEST CASE 06: TÌM KIẾM BÁC SĨ
    # =====================================================

    def test_06_tim_kiem_bac_si(self):

        self.driver.get(
            BASE_URL + "/bac-si"
        )

        search = self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "input[aria-label='Tìm bác sĩ']"
                )
            )
        )

        search.clear()

        search.send_keys(
            "Nguyễn Minh Anh"
        )

        self.wait_text(
            "Nguyễn Minh Anh"
        )

        doctors = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".doctor-card"
        )

        self.assertGreater(
            len(doctors),
            0
        )

    # =====================================================
    # TEST CASE 07: XEM CHI TIẾT BÁC SĨ
    # =====================================================

    def test_07_xem_chi_tiet_bac_si(self):

        self.driver.get(
            BASE_URL + "/bac-si"
        )

        nut_chi_tiet = self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//a[contains(normalize-space(), "
                    "'Xem chi tiết')]"
                )
            )
        )

        self.click_element(
            nut_chi_tiet
        )

        self.wait.until(
            EC.url_matches(
                r".*/bac-si/\d+$"
            )
        )

        self.wait_text("Giới thiệu")

        self.wait_text("Đặt lịch khám")

    # =====================================================
    # TEST CASE 08: NGƯỜI CHƯA ĐĂNG NHẬP KHÔNG ĐƯỢC ĐẶT LỊCH
    # =====================================================

    def test_08_nguoi_chua_dang_nhap_khong_duoc_dat_lich(self):

        self.driver.get(
            BASE_URL + "/bac-si"
        )

        nut_dat_lich = self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "(//a[contains(normalize-space(), "
                    "'Đặt lịch')])[1]"
                )
            )
        )

        self.click_element(
            nut_dat_lich
        )

        self.wait.until(
            EC.url_contains("/dang-nhap")
        )

        self.assertIn(
            "/dang-nhap",
            self.driver.current_url
        )

    # =====================================================
    # TEST CASE 09: BỆNH NHÂN XEM TÀI KHOẢN VÀ LỊCH KHÁM
    # =====================================================

    def test_09_benh_nhan_xem_trang_tai_khoan_va_lich_kham(self):

        self.login(
            PATIENT_EMAIL
        )

        self.wait.until(
            EC.url_contains("/tai-khoan")
        )

        self.wait_text(
            "Lịch khám của bạn"
        )

        self.wait_text(
            "Đăng xuất"
        )

    # =====================================================
    # TEST CASE 10: BỆNH NHÂN ĐẶT LỊCH KHÁM
    # =====================================================
    
    def test_10_benh_nhan_dat_lich_kham(self):
        """TC10: Bệnh nhân đăng nhập và đặt lịch khám thành công."""

        # 1. Đăng nhập và PHẢI chờ đăng nhập hoàn tất.
        # Hàm self.login() chỉ nhấn nút submit, không chờ request đăng nhập.
        # Nếu chuyển trang ngay, trình duyệt có thể hủy request và chưa lưu token.
        self.login(PATIENT_EMAIL, PASSWORD)

        self.wait.until(
            EC.url_contains("/tai-khoan")
        )

        # 2. Xác nhận phiên đăng nhập đã được lưu trong localStorage.
        thong_tin_dang_nhap = self.driver.execute_script(
            """
            return {
                token: localStorage.getItem('medicare_token'),
                user: localStorage.getItem('medicare_user')
            };
            """
        )

        self.assertTrue(
            thong_tin_dang_nhap.get("token"),
            "Đăng nhập xong nhưng không tìm thấy medicare_token trong localStorage."
        )

        self.assertTrue(
            thong_tin_dang_nhap.get("user"),
            "Đăng nhập xong nhưng không tìm thấy medicare_user trong localStorage."
        )

        # 3. Xác nhận token được backend chấp nhận.
        # Điều này giúp phân biệt lỗi đăng nhập/lưu token với lỗi điều hướng frontend.
        ket_qua_xac_thuc = self.driver.execute_async_script(
            """
            const token = arguments[0];
            const callback = arguments[arguments.length - 1];

            fetch('http://localhost:4000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(async response => {
                const body = await response.text();
                callback({
                    status: response.status,
                    body: body
                });
            })
            .catch(error => callback({
                status: 0,
                body: String(error)
            }));
            """,
            thong_tin_dang_nhap["token"]
        )

        self.assertEqual(
            ket_qua_xac_thuc["status"],
            200,
            "Backend không chấp nhận token đăng nhập. "
            f"HTTP {ket_qua_xac_thuc['status']}: {ket_qua_xac_thuc['body']}"
        )

        # 4. Sau khi chắc chắn đã đăng nhập, mở danh sách bác sĩ.
        self.driver.get(BASE_URL + "/bac-si")

        nut_dat_lich = self.wait.until(
            EC.presence_of_element_located((
                By.XPATH,
                "//a[contains(@href, '/dat-lich/')]"
            ))
        )

        duong_dan = nut_dat_lich.get_attribute("href")

        self.assertTrue(
            duong_dan and "/dat-lich/" in duong_dan,
            "Không tìm thấy đường dẫn đặt lịch hợp lệ của bác sĩ."
        )

        # 5. Mở trang đặt lịch và kiểm tra không bị chuyển về đăng nhập.
        self.driver.get(duong_dan)

        self.wait.until(
            lambda driver: "/dat-lich/" in driver.current_url
            or "/dang-nhap" in driver.current_url
        )

        self.assertIn(
            "/dat-lich/",
            self.driver.current_url,
            "Đã đăng nhập nhưng vẫn bị chuyển về trang đăng nhập khi mở trang đặt lịch. "
            f"URL hiện tại: {self.driver.current_url}"
        )

        self.wait_text("Thông tin lịch khám")

        # 6. Tìm ngày có khung giờ khám còn trống trong 30 ngày tới.
        ngay_chon = None
        gio_chon = None

        for i in range(1, 31):
            ngay_str = (date.today() + timedelta(days=i)).strftime("%Y-%m-%d")

            try:
                o_ngay = self.wait.until(
                    EC.presence_of_element_located((
                        By.CSS_SELECTOR,
                        "input[type='date']"
                    ))
                )

                # Cập nhật giá trị input và phát sự kiện để React nhận thay đổi.
                self.driver.execute_script(
                    """
                    const input = arguments[0];
                    const value = arguments[1];
                    const setter = Object.getOwnPropertyDescriptor(
                        HTMLInputElement.prototype, 'value'
                    ).set;

                    setter.call(input, value);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    """,
                    o_ngay,
                    ngay_str
                )

                time.sleep(1.2)

                cac_gio = self.driver.find_elements(
                    By.CSS_SELECTOR,
                    ".slot-grid button.slot"
                )

                for nut_gio in cac_gio:
                    try:
                        lop = nut_gio.get_attribute("class") or ""

                        if (
                            nut_gio.is_displayed()
                            and nut_gio.is_enabled()
                            and "disabled" not in lop.lower()
                        ):
                            ngay_chon = ngay_str
                            gio_chon = nut_gio
                            break

                    except StaleElementReferenceException:
                        continue

                if gio_chon is not None:
                    break

            except (StaleElementReferenceException, TimeoutException):
                continue

        # 7. Nếu không có lịch trống, báo rõ đây là vấn đề dữ liệu/lịch làm việc.
        if ngay_chon is None or gio_chon is None:
            noi_dung = self.driver.find_element(
                By.TAG_NAME, "body"
            ).text

            self.fail(
                "Không tìm thấy ngày và khung giờ khám còn trống trong 30 ngày tới. "
                "Cần kiểm tra lịch làm việc và dữ liệu mẫu của bác sĩ.\n"
                f"Nội dung trang hiện tại:\n{noi_dung}"
            )

        # 8. Chọn giờ khám.
        self.click_element(gio_chon)
        gio_kham = gio_chon.text

        try:
            self.wait.until(
                lambda driver: (
                    gio_chon.get_attribute("aria-checked") == "true"
                    and "slot--selected" in (gio_chon.get_attribute("class") or "")
                )
            )
        except (TimeoutException, StaleElementReferenceException):
            nut_gio_moi = None
            for nut_gio in self.driver.find_elements(
                By.CSS_SELECTOR,
                ".slot-grid button.slot"
            ):
                if (
                    nut_gio.text.strip() == gio_kham
                    and nut_gio.is_enabled()
                    and nut_gio.is_displayed()
                ):
                    nut_gio_moi = nut_gio
                    break

            self.assertIsNotNone(
                nut_gio_moi,
                "Không thể tìm lại khung giờ khám sau khi tải lại lịch."
            )
            nut_gio_moi.click()
            self.wait.until(
                lambda driver: (
                    nut_gio_moi.get_attribute("aria-checked") == "true"
                    and "slot--selected" in (nut_gio_moi.get_attribute("class") or "")
                )
            )

        # 9. Nhập lý do khám.
        o_ly_do = self.wait.until(
            EC.visibility_of_element_located((
                By.CSS_SELECTOR,
                "textarea"
            ))
        )
        o_ly_do.clear()
        o_ly_do.send_keys("Kiểm tra sức khỏe tổng quát")

        # 10. Xác nhận đặt lịch.
        nut_xac_nhan = self.wait.until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//button[contains(., 'Xác nhận đặt lịch')]"
            ))
        )
        self.click_element(nut_xac_nhan)

        # 11. Kiểm tra thông báo thành công.
        try:
            self.wait.until(
                lambda driver: (
                    "đặt lịch thành công" in
                    driver.find_element(By.TAG_NAME, "body").text.lower()
                    or "đặt lịch thành công!" in
                    driver.find_element(By.TAG_NAME, "body").text.lower()
                )
            )
        except TimeoutException:
            self.fail(
                "Đã nhấn xác nhận nhưng không nhận được thông báo đặt lịch thành công.\n"
                "Nội dung trang hiện tại:\n"
                + self.driver.find_element(By.TAG_NAME, "body").text
            )

        print(
            f"\nTC10: Booking successful. Appointment date: {ngay_chon}"
        )

    # =====================================================
    # TEST CASE 11: BÁC SĨ TRUY CẬP DASHBOARD
    # =====================================================

    def test_11_bac_si_truy_cap_dashboard(self):

        self.login(
            DOCTOR_EMAIL
        )

        self.wait.until(
            EC.url_contains(
                "/bac-si-dashboard"
            )
        )

        self.wait_text(
            "Bảng điều khiển bác sĩ"
        )

        self.wait_text(
            "Lịch hẹn"
        )

    # =====================================================
    # TEST CASE 12: ADMIN TRUY CẬP TRANG QUẢN TRỊ
    # =====================================================

    def test_12_admin_truy_cap_trang_quan_tri(self):

        self.login(
            ADMIN_EMAIL
        )

        self.wait.until(
            EC.url_contains(
                "/quan-tri"
            )
        )

        self.wait_text(
            "Quản trị MediCare"
        )

        self.wait_text(
            "Lịch hẹn"
        )

    # =====================================================
    # TEST CASE 13: ĐỔI GIAO DIỆN SÁNG/TỐI
    # =====================================================

    def test_13_doi_giao_dien_sang_toi(self):

        toggle = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    "button.theme-toggle"
                )
            )
        )

        html = self.driver.find_element(
            By.TAG_NAME,
            "html"
        )

        before = html.get_attribute(
            "data-theme"
        )

        class_before = html.get_attribute(
            "class"
        )

        self.click_element(
            toggle
        )

        # Chờ giao diện thay đổi
        def theme_changed(driver):

            current_html = driver.find_element(
                By.TAG_NAME,
                "html"
            )

            current_theme = current_html.get_attribute(
                "data-theme"
            )

            current_class = current_html.get_attribute(
                "class"
            )

            return (
                current_theme != before
                or current_class != class_before
            )

        changed = WebDriverWait(
            self.driver,
            5
        ).until(
            theme_changed
        )

        self.assertTrue(
            changed,
            "Giao diện không thay đổi sau khi nhấn nút đổi theme."
        )


# =========================================================
# 3. CHẠY CHƯƠNG TRÌNH KIỂM THỬ
# =========================================================

if __name__ == "__main__":

    unittest.main(
        verbosity=2
    )
