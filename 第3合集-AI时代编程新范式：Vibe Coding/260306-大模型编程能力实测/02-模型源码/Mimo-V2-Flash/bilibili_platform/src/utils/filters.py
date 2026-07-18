from datetime import datetime


def datetime_format(value):
    if value is None:
        return "未知时间"
    try:
        if isinstance(value, int):
            dt = datetime.fromtimestamp(value)
        else:
            dt = datetime.strptime(str(value), "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return str(value)


def format_duration(seconds):
    if seconds is None:
        return "未知时长"
    try:
        seconds = int(seconds)
        minutes = seconds // 60
        hours = minutes // 60
        if hours > 0:
            return f"{hours}:{minutes % 60:02d}:{seconds % 60:02d}"
        else:
            return f"{minutes}:{seconds % 60:02d}"
    except:
        return str(seconds)


def format_number(value):
    if value is None:
        return "0"
    try:
        value = int(value)
        if value >= 100000000:
            return f"{value / 100000000:.1f}亿"
        elif value >= 10000:
            return f"{value / 10000:.1f}万"
        else:
            return str(value)
    except:
        return str(value)


def format_time(seconds):
    if seconds is None:
        return "00:00"
    try:
        seconds = int(seconds)
        minutes = seconds // 60
        seconds = seconds % 60
        return f"{minutes:02d}:{seconds:02d}"
    except:
        return "00:00"


def register_filters(app):
    app.jinja_env.filters["datetime_format"] = datetime_format
    app.jinja_env.filters["format_duration"] = format_duration
    app.jinja_env.filters["format_number"] = format_number
    app.jinja_env.filters["format_time"] = format_time
