package com.gstbilling.service;

public class NumberToWords {
    private static final String[] ones = {
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    };
    private static final String[] tens = {
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convert(long number) {
        if (number == 0) return "Zero";
        if (number < 0) return "Minus " + convert(-number);
        return convertHelper(number).trim();
    }

    private static String convertHelper(long number) {
        if (number == 0) return "";
        if (number < 20) return ones[(int) number] + " ";
        if (number < 100) return tens[(int) (number / 10)] + " " + convertHelper(number % 10);
        if (number < 1000) return ones[(int) (number / 100)] + " Hundred " + convertHelper(number % 100);
        if (number < 100000) return convertHelper(number / 1000) + "Thousand " + convertHelper(number % 1000);
        if (number < 10000000) return convertHelper(number / 100000) + "Lakh " + convertHelper(number % 100000);
        return convertHelper(number / 10000000) + "Crore " + convertHelper(number % 10000000);
    }
}
