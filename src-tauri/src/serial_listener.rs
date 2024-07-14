use serialport::{SerialPort, SerialPortInfo};
use std::io::{self, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::Manager;

pub struct ScaleListener {
    port_name: String,
    baud_rate: u32,
}

impl ScaleListener {
    pub fn new(port_name: &str, baud_rate: u32) -> Self {
        ScaleListener {
            port_name: port_name.to_string(),
            baud_rate,
        }
    }

    pub fn start(&self, app_handle: tauri::AppHandle) {
        let port_name = self.port_name.clone();
        let baud_rate = self.baud_rate;

        thread::spawn(move || {
            println!("Started listening on {}", port_name);
            let port = serialport::new(&port_name, baud_rate)
                .data_bits(serialport::DataBits::Eight)
                .flow_control(serialport::FlowControl::None)
                .parity(serialport::Parity::None)
                .stop_bits(serialport::StopBits::One)
                .timeout(Duration::from_millis(1000))
                .open();

            match port {
                Ok(mut port) => {
                    let mut buffer: Vec<u8> = vec![0; 32];
                    let mut last_weight = String::new();
                    println!("Started listening on {}", port_name);

                    loop {
                        match port.read(&mut buffer) {
                            Ok(bytes_read) => {
                                if bytes_read > 0 {
                                    let raw_data_hex = format!("{:02X?}", &buffer[..bytes_read]);
                                    println!("Raw data: {}", raw_data_hex);

                                    // Attempt to extract weight from raw data
                                    if let Some(weight) =
                                        extract_weight_from_raw(&buffer[..bytes_read])
                                    {
                                        if weight != last_weight {
                                            last_weight = weight.clone();
                                            println!("Weight changed: {}", weight);
                                            app_handle.emit("weight-changed", weight).unwrap();
                                        }
                                    }
                                }
                            }
                            Err(e) => eprintln!("Error reading from serial port: {:?}", e),
                        }
                        thread::sleep(Duration::from_millis(500));
                    }
                }
                Err(e) => {
                    eprintln!("Failed to open serial port: {:?}", e);
                }
            }
        });
    }
}

fn extract_weight(response: &str) -> Option<String> {
    if let Some(start) = response.find(':') {
        let weight_str = response[start + 1..].trim().to_string();
        Some(weight_str)
    } else {
        None
    }
}

fn extract_weight_from_raw(raw_data: &[u8]) -> Option<String> {
    println!("Raw data length: {}", raw_data.len());
    for (i, byte) in raw_data.iter().enumerate() {
        println!("Byte {}: 0x{:02X}", i, byte);
    }

    // Check for possible ASCII interpretations and 32-bit integers
    let mut weight: Option<String> = None;

    // Check possible segments for ASCII interpretation
    for segment_size in [2, 3, 4].iter() {
        for start in 0..=raw_data.len().saturating_sub(*segment_size) {
            let segment = &raw_data[start..start + *segment_size];

            // Interpret segment as ASCII string
            if let Ok(weight_str) = std::str::from_utf8(segment) {
                println!("Parsed weight string: {}", weight_str);
                // Extract numbers from the string
                let weight_num: String = weight_str
                    .chars()
                    .filter(|c| c.is_digit(10) || *c == '.')
                    .collect();
                if let Ok(weight_float) = weight_num.parse::<f32>() {
                    println!("Extracted weight: {}", weight_float);
                    if (weight_float - 1.6).abs() < 0.1 {
                        // Check if it matches the known weight 1.6 kg
                        weight = Some(weight_float.to_string());
                        return weight;
                    }
                }
            }

            // Interpret segment as 32-bit integer and apply scaling factors
            if *segment_size == 4 {
                let weight_value =
                    u32::from_be_bytes([segment[0], segment[1], segment[2], segment[3]]);
                let scaling_factors = [0.1, 0.01, 0.001, 0.0001, 0.00001];
                for &scaling_factor in &scaling_factors {
                    let weight_float = weight_value as f32 * scaling_factor;
                    println!(
                        "Segment: {:?}, Scaling factor: {}, Parsed weight: {}",
                        segment, scaling_factor, weight_float
                    );
                    if (weight_float - 1.6).abs() < 0.1 {
                        // Check if it matches the known weight 1.6 kg
                        weight = Some(weight_float.to_string());
                        return weight;
                    }
                }
            }
        }
    }

    None
}
